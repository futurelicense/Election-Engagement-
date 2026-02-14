/**
 * Site-wide config for SEO, canonical URLs, and branding.
 * VITE_SITE_URL should be set in production (e.g. https://www.nigeriaelection.com).
 */
export const SITE_NAME = 'Nigeria Election';
export const SITE_DEFAULT_DESCRIPTION =
  'Engage with democracy in Nigeria. Vote, comment, and stay informed about upcoming elections.';
export const SITE_DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=630&fit=crop';

/** Base URL for canonical links. Use env in build, fallback to origin in browser. */
export function getSiteUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    return (import.meta.env.VITE_SITE_URL as string).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://www.nigeriaelection.com';
}

export function getCanonicalUrl(path: string = ''): string {
  const base = getSiteUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return p === '/' ? base : `${base}${p}`;
}
