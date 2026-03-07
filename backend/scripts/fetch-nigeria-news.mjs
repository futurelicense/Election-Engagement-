#!/usr/bin/env node
/**
 * Google News RSS → Supabase news fetcher
 *
 * Pulls Nigerian election news from Google News RSS and inserts new articles
 * into the Supabase `news` table. Safe to run repeatedly — deduplicates by title.
 *
 * Usage:
 *   node scripts/fetch-nigeria-news.mjs
 *   node scripts/fetch-nigeria-news.mjs --dry-run      # preview without inserting
 *   node scripts/fetch-nigeria-news.mjs --max 20       # limit articles (default: 30)
 *
 * Requires backend/.env with:
 *   SUPABASE_URL=...
 *   SUPABASE_SERVICE_KEY=...
 *
 * Schedule (cron example – runs every 2 hours):
 *   0 */2 * * * cd /path/to/project && node backend/scripts/fetch-nigeria-news.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

/** Google News RSS feeds to pull from (all scoped to Nigeria/elections) */
const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=nigeria+election&hl=en-NG&gl=NG&ceid=NG:en',
    priority: 'important',
  },
  {
    url: 'https://news.google.com/rss/search?q=nigeria+politics+2024+2025&hl=en-NG&gl=NG&ceid=NG:en',
    priority: 'general',
  },
  {
    url: 'https://news.google.com/rss/search?q=INEC+Nigeria&hl=en-NG&gl=NG&ceid=NG:en',
    priority: 'important',
  },
  {
    url: 'https://news.google.com/rss/search?q=nigeria+breaking+news+election&hl=en-NG&gl=NG&ceid=NG:en',
    priority: 'breaking',
  },
];

/** Slugs/keywords that indicate breaking/important news — upgrades priority */
const BREAKING_KEYWORDS = ['breaking', 'just in', 'result', 'winner', 'declared', 'tribunal', 'court', 'arrested', 'killed', 'violence', 'rigging'];
const IMPORTANT_KEYWORDS = ['candidate', 'inec', 'campaign', 'primary', 'governorship', 'senatorial', 'presidential', 'manifesto', 'debate', 'vote'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadEnv() {
  const path = resolve(__dirname, '../.env');
  try {
    const content = readFileSync(path, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    return env;
  } catch {
    console.error('ERROR: Create backend/.env with SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    max: (() => {
      const i = args.indexOf('--max');
      return i !== -1 && args[i + 1] ? parseInt(args[i + 1], 10) : 30;
    })(),
  };
}

/** Minimal XML tag extractor — avoids adding an XML parser dependency */
function extractTag(xml, tag) {
  const open = `<${tag}>`;
  const openCdata = `<${tag}><![CDATA[`;
  const close = `</${tag}>`;
  let start = xml.indexOf(openCdata);
  if (start !== -1) {
    start += openCdata.length;
    const end = xml.indexOf(']]>', start);
    return end !== -1 ? xml.slice(start, end).trim() : null;
  }
  start = xml.indexOf(open);
  if (start === -1) return null;
  start += open.length;
  const end = xml.indexOf(close, start);
  return end !== -1 ? xml.slice(start, end).trim() : null;
}

function parseRssItems(xml) {
  const items = [];
  let pos = 0;
  while (true) {
    const start = xml.indexOf('<item>', pos);
    if (start === -1) break;
    const end = xml.indexOf('</item>', start);
    if (end === -1) break;
    const chunk = xml.slice(start + 6, end);

    const title = extractTag(chunk, 'title') ?? '';
    const link = extractTag(chunk, 'link') ?? '';
    const pubDate = extractTag(chunk, 'pubDate') ?? '';
    const description = extractTag(chunk, 'description') ?? '';
    const source = extractTag(chunk, 'source') ?? '';

    if (title && link) {
      items.push({ title, link, pubDate, description, source });
    }
    pos = end + 7;
  }
  return items;
}

function inferPriority(title, basePriority) {
  const lower = title.toLowerCase();
  if (BREAKING_KEYWORDS.some((k) => lower.includes(k))) return 'breaking';
  if (IMPORTANT_KEYWORDS.some((k) => lower.includes(k))) return 'important';
  return basePriority;
}

/** Strip HTML tags from description */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function generateId() {
  return 'n_' + Math.random().toString(36).slice(2, 14);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function fetchFeed(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ElectionNewsBot/1.0)',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  const env = loadEnv();
  const { dryRun, max } = parseArgs();

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY required in backend/.env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\n🗞️  Nigerian Election News Fetcher`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
  console.log(`   Max articles: ${max}\n`);

  // ── 1. Look up Nigeria country_id ─────────────────────────────────────────
  const { data: country, error: countryErr } = await supabase
    .from('countries')
    .select('id, name')
    .ilike('name', '%nigeria%')
    .maybeSingle();

  if (countryErr) {
    console.error('Failed to query countries:', countryErr.message);
    process.exit(1);
  }
  if (!country) {
    console.error('Nigeria not found in the countries table.');
    console.error('Add Nigeria first via the admin panel, then re-run this script.');
    process.exit(1);
  }
  console.log(`✓ Found country: ${country.name} (id: ${country.id})\n`);

  // ── 2. Load existing news titles to deduplicate ───────────────────────────
  const { data: existing } = await supabase
    .from('news')
    .select('title')
    .eq('country_id', country.id);

  const existingTitles = new Set((existing || []).map((n) => n.title.toLowerCase().trim()));
  console.log(`   Existing articles in DB: ${existingTitles.size}`);

  // ── 3. Fetch all RSS feeds ─────────────────────────────────────────────────
  const allItems = [];
  const seenLinks = new Set();

  for (const feed of RSS_FEEDS) {
    try {
      process.stdout.write(`   Fetching: ${feed.url.slice(0, 80)}...`);
      const xml = await fetchFeed(feed.url);
      const items = parseRssItems(xml);
      let added = 0;
      for (const item of items) {
        if (!seenLinks.has(item.link)) {
          seenLinks.add(item.link);
          allItems.push({ ...item, basePriority: feed.priority });
          added++;
        }
      }
      console.log(` ${items.length} items (${added} new)`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }

  // ── 4. Filter + limit ─────────────────────────────────────────────────────
  const toInsert = allItems
    .filter((item) => !existingTitles.has(item.title.toLowerCase().trim()))
    .slice(0, max);

  console.log(`\n   New articles to insert: ${toInsert.length}\n`);

  if (toInsert.length === 0) {
    console.log('✓ No new articles. DB is up to date.\n');
    return;
  }

  // ── 5. Insert into Supabase ───────────────────────────────────────────────
  let inserted = 0;
  let skipped = 0;

  for (const item of toInsert) {
    const priority = inferPriority(item.title, item.basePriority);
    const content = stripHtml(item.description) || item.title;
    const timestamp = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

    const record = {
      id: generateId(),
      country_id: country.id,
      title: item.title.slice(0, 500),
      content: content.slice(0, 5000),
      priority,
      timestamp,
      // image: null — Google News doesn't provide images in RSS
    };

    const tag = `[${priority.padEnd(9)}] ${item.title.slice(0, 70)}`;

    if (dryRun) {
      console.log(`  ○ ${tag}`);
      inserted++;
      continue;
    }

    const { error } = await supabase.from('news').insert(record);
    if (error) {
      console.log(`  ✗ ${tag}`);
      console.log(`    → ${error.message}`);
      skipped++;
    } else {
      console.log(`  ✓ ${tag}`);
      inserted++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Inserted: ${inserted}`);
  if (skipped > 0) console.log(`   Skipped:  ${skipped}`);
  console.log();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
