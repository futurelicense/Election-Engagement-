import 'dotenv/config';
import { createApp } from '../backend/dist/app.js';

let app: ReturnType<typeof createApp>;

export default function handler(req: any, res: any) {
  try {
    // Vercel can pass the path without /api prefix; Express expects /api/auth/login etc.
    const path = req.url?.split('?')[0] ?? '';
    const query = req.url?.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
    if (path && !path.startsWith('/api')) {
      req.url = '/api' + (path.startsWith('/') ? path : '/' + path) + query;
    }
    if (!app) app = createApp();
    return app(req, res);
  } catch (err: any) {
    console.error('API init/run error:', err);
    res.status(500).setHeader('Content-Type', 'application/json').end(
      JSON.stringify({
        error: err?.message || 'Internal Server Error',
        hint: 'Add SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET in Vercel → Settings → Environment Variables, then redeploy.',
      })
    );
  }
}
