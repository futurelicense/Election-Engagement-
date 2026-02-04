import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_DEFAULT_IMAGE, getCanonicalUrl } from '../config/site';

export interface SEOProps {
  title: string;
  description: string;
  /** Target length 150–160 chars for meta description. */
  keywords?: string[];
  image?: string;
  /** Full canonical URL, or path (e.g. "/" or "/election/ng"). If path, base URL from config is used. */
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Single JSON-LD object or array of objects for rich results. */
  structuredData?: object | object[];
  /** For article type: ISO date. */
  publishedTime?: string;
  /** For article type: ISO date. */
  modifiedTime?: string;
  /** Optional image alt for social sharing. */
  imageAlt?: string;
}

const DEFAULT_IMAGE = SITE_DEFAULT_IMAGE;
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

export function SEO({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  structuredData,
  publishedTime,
  modifiedTime,
  imageAlt,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl =
    url === undefined
      ? (typeof window !== 'undefined' ? window.location.href : getCanonicalUrl('/'))
      : url.startsWith('http')
        ? url
        : getCanonicalUrl(url);
  const imageUrl = image && image.startsWith('http') ? image : (image ? getCanonicalUrl(image) : DEFAULT_IMAGE);
  const alt = imageAlt || `${title} – ${SITE_NAME}`;

  const schemas = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];

  return (
    <Helmet>
      {/* Primary meta – critical for organic search */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Crawl control */}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph – Facebook, LinkedIn, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={alt} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card – large image, better CTR */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={alt} />

      {/* Extra meta for crawlers */}
      <meta name="author" content="Nigeria Election Platform" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="NG" />

      {/* Structured data – multiple JSON-LD scripts for rich results */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
