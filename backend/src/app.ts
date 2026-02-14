import express from 'express';
import cors from 'cors';
import { getSupabase } from './db/supabase.js';
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import electionsRoutes from './routes/elections.js';
import candidatesRoutes from './routes/candidates.js';
import votesRoutes from './routes/votes.js';
import newsRoutes from './routes/news.js';
import commentsRoutes from './routes/comments.js';
import chatRoutes from './routes/chat.js';
import settingsRoutes from './routes/settings.js';

/** Normalize req.url so routes always see /api/... (needed when running behind Vercel serverless). */
function normalizeApiPath(req: express.Request, _res: express.Response, next: express.NextFunction) {
  let path = req.url?.split('?')[0] ?? '';
  const query = req.url?.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname;
    } catch {
      path = '';
    }
  }
  if (!path.startsWith('/')) path = '/' + path;
  if (!path.startsWith('/api')) path = '/api' + path;
  req.url = path + query;
  next();
}

export function createApp() {
  const app = express();

  app.use(normalizeApiPath);

  // In development, allow any localhost port so CORS works regardless of Vite port (5173, 5174, etc.)
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origins = corsOrigin.split(',').map((o) => o.trim());
  const isDev = process.env.NODE_ENV !== 'production';
  app.use(
    cors({
      origin: isDev
        ? (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
              cb(null, true);
            } else {
              cb(null, origins.includes(origin));
            }
          }
        : origins,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/countries', countriesRoutes);
  app.use('/api/elections', electionsRoutes);
  app.use('/api/candidates', candidatesRoutes);
  app.use('/api/votes', votesRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/comments', commentsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/settings', settingsRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  /** Returns 503 with clear message if Supabase env vars are missing (for Vercel debugging). */
  app.get('/api/status', (_req, res) => {
    try {
      getSupabase();
      res.json({ ok: true, database: 'configured' });
    } catch (e: any) {
      res.status(503).json({
        ok: false,
        error: e?.message || 'Database not configured',
        fix: 'Add SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel → Project → Settings → Environment Variables, then redeploy.',
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Catch any uncaught errors so the serverless function doesn't crash (Vercel FUNCTION_INVOCATION_FAILED)
  app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
    console.error('Uncaught error:', err);
    res.status(500).json({
      error: err?.message || 'Internal Server Error',
      hint: 'Check Vercel Function Logs. Ensure SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET are set in Vercel Environment Variables.',
    });
  });

  return app;
}
