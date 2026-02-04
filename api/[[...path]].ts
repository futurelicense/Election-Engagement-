import 'dotenv/config';
import { createApp } from '../backend/dist/app.js';

let app: ReturnType<typeof createApp>;

export default function handler(req: any, res: any) {
  try {
    // Normalize req.url so Express sees /api/... (pathname + query). Vercel may send full URL or path without /api.
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
