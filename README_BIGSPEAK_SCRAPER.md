# BigSpeak Speakers Scraper

This scraper fetches speaker metadata from [BigSpeak Speakers Bureau](https://www.bigspeak.com/keynote-speakers/) and saves it to JSON format for database import.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run the scraper:**
```bash
npm run scrape:bigspeak
```

Or directly:
```bash
node scrape-bigspeak.js
```

## What it does

- Fetches up to **40 pages** of speaker listings from BigSpeak
- Extracts the following metadata for each speaker:
  - Name
  - Short bio/tagline
  - Speaking topics
  - Fee range (min/max in USD)
  - Fee label (raw text like "$40,001 - $50,000" or "Please Inquire")
  - Availability status
  - Profile image URL
  - Profile page URL
  - Slug (for deduplication)

## Output

The scraper creates:
- `./bigspeak-data/speakers.json` - Complete JSON file with all scraped data

The JSON structure:
```json
{
  "metadata": {
    "source": "BigSpeak Speakers Bureau",
    "source_url": "https://www.bigspeak.com/keynote-speakers/",
    "scraped_at": "2025-01-XX...",
    "total_speakers": 800,
    "pages_scraped": 40
  },
  "speakers": [
    {
      "slug": "elatia-abate",
      "source_url": "https://www.bigspeak.com/...",
      "name": "Elatia Abate",
      "bio_short": "Entrepreneur, Futurist, and Educator...",
      "fee_min": 40001,
      "fee_max": 50000,
      "fee_label": "$40,001 - $50,000",
      "fee_currency": "USD",
      "topics": ["Adversity", "Artificial Intelligence (AI) Keynote Speakers", "Business Speakers"],
      "image_url": "https://...",
      ...
    }
  ]
}
```

## Database Import

After scraping, you can import the data into PostgreSQL using the schema in `bigspeak_speakers_schema.sql`:

1. **Create the database schema:**
```sql
-- Run in your PostgreSQL database
\i bigspeak_speakers_schema.sql
```

2. **Import the JSON data** (you'll need to create an import script or use a tool like `psql` with a custom script)

## Features

- ✅ Rate limiting (5 concurrent requests)
- ✅ Retry logic for failed requests
- ✅ Deduplication by slug
- ✅ Error handling and logging
- ✅ Progress tracking
- ✅ Handles pagination automatically
- ✅ Extracts fee ranges, topics, images, and availability

## Notes

- The scraper respects rate limits with 1-second delays between pages
- Failed pages are logged but don't stop the entire process
- The scraper automatically detects pagination patterns
- All speakers are deduplicated by slug to prevent duplicates

## Troubleshooting

If you encounter issues:

1. **Network errors**: Check your internet connection
2. **Rate limiting**: The scraper includes delays, but if BigSpeak blocks you, increase delays in the code
3. **Parsing errors**: The HTML structure may have changed - check the selectors in `parseSpeakerCards()`

## Next Steps

After scraping:
1. Review the JSON output
2. Import into database using the schema
3. Optionally fetch detail pages for full bios and additional metadata

