import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

/** Google News RSS feeds targeting Nigerian election news */
const RSS_FEEDS: Array<{ url: string; priority: 'breaking' | 'important' | 'general' }> = [
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

const BREAKING_KEYWORDS = ['breaking', 'just in', 'result', 'winner', 'declared', 'tribunal', 'court', 'arrested', 'killed', 'violence', 'rigging'];
const IMPORTANT_KEYWORDS = ['candidate', 'inec', 'campaign', 'primary', 'governorship', 'senatorial', 'presidential', 'manifesto', 'debate', 'vote'];

export interface AutoFetchResult {
  inserted: number;
  skipped: number;
  total: number;
  countryId: string;
}

// ── XML helpers (no external XML parser dependency) ──────────────────────────

function extractTag(xml: string, tag: string): string | null {
  const openCdata = `<${tag}><![CDATA[`;
  let start = xml.indexOf(openCdata);
  if (start !== -1) {
    start += openCdata.length;
    const end = xml.indexOf(']]>', start);
    return end !== -1 ? xml.slice(start, end).trim() : null;
  }
  const open = `<${tag}>`;
  start = xml.indexOf(open);
  if (start === -1) return null;
  start += open.length;
  const end = xml.indexOf(`</${tag}>`, start);
  return end !== -1 ? xml.slice(start, end).trim() : null;
}

function parseRssItems(xml: string): Array<{ title: string; link: string; pubDate: string; description: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
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
    if (title && link) items.push({ title, link, pubDate, description });
    pos = end + 7;
  }
  return items;
}

function inferPriority(title: string, base: 'breaking' | 'important' | 'general'): 'breaking' | 'important' | 'general' {
  const lower = title.toLowerCase();
  if (BREAKING_KEYWORDS.some((k) => lower.includes(k))) return 'breaking';
  if (IMPORTANT_KEYWORDS.some((k) => lower.includes(k))) return 'important';
  return base;
}

function stripHtml(html: string): string {
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

async function fetchRss(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ElectionNewsBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchNigeriaNews(supabase: SupabaseClient, maxArticles = 30): Promise<AutoFetchResult> {
  // 1. Find Nigeria country_id
  const { data: country, error: countryErr } = await supabase
    .from('countries')
    .select('id')
    .ilike('name', '%nigeria%')
    .maybeSingle();

  if (countryErr) throw new Error(`Country lookup failed: ${countryErr.message}`);
  if (!country) throw new Error('Nigeria not found in countries table. Add it via the admin panel first.');

  const countryId: string = country.id;

  // 2. Load existing titles to deduplicate
  const { data: existing } = await supabase.from('news').select('title').eq('country_id', countryId);
  const existingTitles = new Set((existing ?? []).map((n: any) => (n.title as string).toLowerCase().trim()));

  // 3. Fetch all RSS feeds
  const allItems: Array<{ title: string; link: string; pubDate: string; description: string; priority: 'breaking' | 'important' | 'general' }> = [];
  const seenLinks = new Set<string>();

  for (const feed of RSS_FEEDS) {
    try {
      const xml = await fetchRss(feed.url);
      for (const item of parseRssItems(xml)) {
        if (!seenLinks.has(item.link)) {
          seenLinks.add(item.link);
          allItems.push({ ...item, priority: feed.priority });
        }
      }
    } catch {
      // Skip failed feeds and continue
    }
  }

  // 4. Filter to new articles only, cap at maxArticles
  const toInsert = allItems
    .filter((item) => !existingTitles.has(item.title.toLowerCase().trim()))
    .slice(0, maxArticles);

  // 5. Insert into Supabase
  let inserted = 0;
  let skipped = 0;

  for (const item of toInsert) {
    const priority = inferPriority(item.title, item.priority);
    const content = stripHtml(item.description) || item.title;
    const timestamp = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

    const { error } = await supabase.from('news').insert({
      id: `n_${nanoid(12)}`,
      country_id: countryId,
      title: item.title.slice(0, 500),
      content: content.slice(0, 5000),
      priority,
      timestamp,
    });

    if (error) {
      skipped++;
    } else {
      inserted++;
    }
  }

  return { inserted, skipped, total: toInsert.length, countryId };
}
