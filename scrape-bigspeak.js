#!/usr/bin/env node

/**
 * BigSpeak Speakers Scraper
 * Fetches speaker metadata from https://www.bigspeak.com/keynote-speakers/
 * Scrapes up to 40 pages of speaker listings
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import pLimit from 'p-limit';

const BASE_URL = 'https://www.bigspeak.com';
const START_URL = `${BASE_URL}/keynote-speakers/`;
const MAX_PAGES = 40;
const OUTPUT_DIR = './bigspeak-data';
const OUTPUT_FILE = join(OUTPUT_DIR, 'speakers.json');
const RATE_LIMIT = 5; // concurrent requests

// Create output directory
mkdirSync(OUTPUT_DIR, { recursive: true });

const limit = pLimit(RATE_LIMIT);

/**
 * Parse fee range from label
 * Examples: "$40,001 - $50,000" -> { min: 40001, max: 50000 }
 *           "Please Inquire" -> { min: null, max: null }
 */
function parseFeeRange(feeLabel) {
  if (!feeLabel || feeLabel.toLowerCase().includes('inquire')) {
    return { fee_min: null, fee_max: null };
  }

  // Match patterns like "$40,001 - $50,000" or "$10,001-$20,000"
  const match = feeLabel.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
  if (!match) {
    // Try single value like "$40,001 +"
    const singleMatch = feeLabel.match(/\$([\d,]+)\s*\+/);
    if (singleMatch) {
      const min = parseInt(singleMatch[1].replace(/,/g, ''), 10);
      return { fee_min: min, fee_max: null };
    }
    return { fee_min: null, fee_max: null };
  }

  const toInt = (str) => parseInt(str.replace(/,/g, ''), 10);
  return {
    fee_min: toInt(match[1]),
    fee_max: toInt(match[2])
  };
}

/**
 * Generate slug from name or URL
 */
function generateSlug(name, url) {
  if (url && url !== START_URL) {
    const urlMatch = url.match(/keynote-speakers\/([^\/]+)/);
    if (urlMatch) return urlMatch[1];
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Fetch a page with retry logic
 */
async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1}/${retries} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

/**
 * Parse speaker cards from listing page
 */
function parseSpeakerCards(html, pageUrl) {
  const $ = cheerio.load(html);
  const speakers = [];

  // Try multiple selectors for speaker cards
  const cardSelectors = [
    'article.speaker-card',
    '.speaker-card',
    '.speaker-item',
    '.speaker-listing',
    'div[class*="speaker"]',
  ];

  let cards = $();
  for (const selector of cardSelectors) {
    cards = $(selector);
    if (cards.length > 0) break;
  }

  // Fallback: look for any div with speaker name pattern
  if (cards.length === 0) {
    $('div, article').each((_, el) => {
      const $el = $(el);
      const hasName = $el.find('h2, h3, h4').length > 0;
      const hasFee = $el.text().includes('Fee Range') || $el.text().includes('$');
      if (hasName && hasFee) {
        cards = cards.add($el);
      }
    });
  }

  cards.each((_, card) => {
    const $card = $(card);

    // Extract name
    const name = $card.find('h2, h3, h4, .speaker-name, [class*="name"]').first().text().trim();
    if (!name || name.length < 2) return;

    // Extract bio/tagline
    const bioShort = $card.find('p, .speaker-title, .speaker-description, em, [class*="bio"], [class*="tagline"]')
      .first()
      .text()
      .trim()
      .replace(/\s+/g, ' ');

    // Extract topics
    const topics = [];
    $card.find('ul li, .topics li, .speaker-topic, [class*="topic"]').each((_, el) => {
      const topic = $(el).text().trim();
      if (topic && topic.length > 2 && !topics.includes(topic)) {
        topics.push(topic);
      }
    });

    // Extract fee range
    let feeLabel = null;
    $card.find('*').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Fee Range') || text.includes('Speaker\'s Fee')) {
        feeLabel = text.replace(/.*Fee[^:]*:?\s*/i, '').trim();
        return false; // break
      }
    });
    
    // Fallback: look for dollar signs
    if (!feeLabel) {
      const feeMatch = $card.text().match(/(?:Fee|Fee Range)[^$]*(\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\+)?|Please Inquire)/i);
      if (feeMatch) {
        feeLabel = feeMatch[1].trim();
      }
    }

    // Extract availability
    let availability = null;
    $card.find('*').each((_, el) => {
      const text = $(el).text();
      if (text.toLowerCase().includes('availability')) {
        availability = text.replace(/.*availability[^:]*:?\s*/i, '').trim() || 'Available';
        return false;
      }
    });

    // Extract image URL
    // BigSpeak uses lazy-loaded CSS background images via data-bg attribute
    let imageUrl = null;
    
    // Method 1: Check for data-bg attribute (CSS background image)
    const $imageLink = $card.find('a.image, .image, [class*="image"]').first();
    if ($imageLink.length) {
      const dataBg = $imageLink.attr('data-bg');
      if (dataBg) {
        // Extract URL from "url(https://...)" format
        const urlMatch = dataBg.match(/url\(['"]?([^'")]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          imageUrl = urlMatch[1];
        }
      }
    }
    
    // Method 2: Check for data-image attribute in action links (higher quality)
    if (!imageUrl) {
      const $actionLink = $card.find('a[data-image]').first();
      if ($actionLink.length) {
        imageUrl = $actionLink.attr('data-image');
      }
    }
    
    // Method 3: Fallback to regular img tag
    if (!imageUrl) {
      const $img = $card.find('img').first();
      if ($img.length) {
        imageUrl = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      }
    }
    
    // Normalize URL
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = imageUrl.startsWith('/') ? BASE_URL + imageUrl : BASE_URL + '/' + imageUrl;
    }

    // Extract profile link
    let profileUrl = pageUrl;
    const $link = $card.find('a[href*="keynote-speakers"], a[href*="speaker"]').first();
    if ($link.length) {
      const href = $link.attr('href');
      if (href) {
        profileUrl = href.startsWith('http') ? href : BASE_URL + (href.startsWith('/') ? href : '/' + href);
      }
    }

    // Parse fee range
    const { fee_min, fee_max } = parseFeeRange(feeLabel);

    // Generate slug
    const slug = generateSlug(name, profileUrl);

    speakers.push({
      slug,
      source_url: profileUrl,
      name,
      bio_short: bioShort || null,
      bio_long: null, // Would need to fetch detail page
      fee_min,
      fee_max,
      fee_label: feeLabel,
      fee_currency: 'USD',
      region: null, // Would need to parse from filters or detail page
      availability: availability || null,
      location: null,
      gender: null,
      topics: topics.length > 0 ? topics : [],
      image_url: imageUrl,
    });
  });

  return speakers;
}

/**
 * Find next page URL
 */
function findNextPageUrl(html, currentPage) {
  const $ = cheerio.load(html);
  
  // Try pagination links
  const nextLink = $('a[aria-label="Next"], a:contains("Next"), .pagination a:contains("Next")').first();
  if (nextLink.length) {
    const href = nextLink.attr('href');
    if (href) {
      return href.startsWith('http') ? href : BASE_URL + (href.startsWith('/') ? href : '/' + href);
    }
  }

  // Try numbered pagination
  const pageLink = $(`a:contains("${currentPage + 1}"), .pagination a[href*="page=${currentPage + 1}"]`).first();
  if (pageLink.length) {
    const href = pageLink.attr('href');
    if (href) {
      return href.startsWith('http') ? href : BASE_URL + (href.startsWith('/') ? href : '/' + href);
    }
  }

  // Construct URL pattern (common patterns)
  const patterns = [
    `${START_URL}?page=${currentPage + 1}`,
    `${START_URL}?pg=${currentPage + 1}`,
    `${START_URL}page/${currentPage + 1}/`,
  ];

  return patterns[0]; // Default pattern
}

/**
 * Scrape all pages
 */
async function scrapeAllPages() {
  const allSpeakers = [];
  const seenSlugs = new Set();
  let currentPage = 1;
  let nextUrl = START_URL;

  console.log(`🚀 Starting scrape of BigSpeak speakers (up to ${MAX_PAGES} pages)...\n`);

  while (currentPage <= MAX_PAGES && nextUrl) {
    try {
      console.log(`📄 Fetching page ${currentPage}... (${nextUrl})`);
      
      const html = await limit(() => fetchPage(nextUrl));
      const speakers = parseSpeakerCards(html, nextUrl);

      // Deduplicate by slug
      const newSpeakers = speakers.filter(s => {
        if (seenSlugs.has(s.slug)) {
          return false;
        }
        seenSlugs.add(s.slug);
        return true;
      });

      allSpeakers.push(...newSpeakers);
      console.log(`   ✓ Found ${newSpeakers.length} new speakers (${speakers.length} total on page, ${allSpeakers.length} cumulative)\n`);

      // Find next page
      nextUrl = findNextPageUrl(html, currentPage);
      
      // Check if we've reached the end
      if (speakers.length === 0) {
        console.log(`   ⚠️  No speakers found on page ${currentPage}, stopping...\n`);
        break;
      }

      currentPage++;
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error on page ${currentPage}:`, error.message);
      console.log(`   Continuing to next page...\n`);
      currentPage++;
      nextUrl = findNextPageUrl('', currentPage);
      
      if (currentPage > MAX_PAGES) break;
    }
  }

  return allSpeakers;
}

/**
 * Main execution
 */
async function main() {
  try {
    const startTime = Date.now();
    const speakers = await scrapeAllPages();
    
    // Save to JSON
    const output = {
      metadata: {
        source: 'BigSpeak Speakers Bureau',
        source_url: START_URL,
        scraped_at: new Date().toISOString(),
        total_speakers: speakers.length,
        pages_scraped: Math.min(MAX_PAGES, speakers.length > 0 ? Math.ceil(speakers.length / 20) : 0),
      },
      speakers: speakers,
    };

    writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Scraping complete!`);
    console.log(`   Total speakers: ${speakers.length}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Output: ${OUTPUT_FILE}\n`);

    // Print summary statistics
    const withFee = speakers.filter(s => s.fee_min !== null).length;
    const withTopics = speakers.filter(s => s.topics.length > 0).length;
    const withImages = speakers.filter(s => s.image_url).length;
    
    console.log(`📊 Summary:`);
    console.log(`   Speakers with fee info: ${withFee}`);
    console.log(`   Speakers with topics: ${withTopics}`);
    console.log(`   Speakers with images: ${withImages}`);
    console.log(`\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

