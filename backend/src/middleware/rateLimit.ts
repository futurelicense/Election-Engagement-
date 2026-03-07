import { Request, Response, NextFunction } from 'express';

interface RateEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter. Creates a per-IP+path counter.
 * @param maxRequests max allowed requests per window
 * @param windowMs   window duration in milliseconds
 */
export function createRateLimit(maxRequests: number, windowMs: number) {
  const store = new Map<string, RateEntry>();

  // Periodically remove expired entries to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? (req.socket?.remoteAddress ?? 'unknown');
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    next();
  };
}
