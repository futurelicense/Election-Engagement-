import 'dotenv/config';
import { createApp } from '../backend/dist/app.js';

let app: ReturnType<typeof createApp>;

/**
 * Single API entry so Vercel always routes /api and /api/* here.
 * Rewrites send /api/:path* -> /api?path=:path so we restore req.url for Express.
 */
export default function handler(req: any, res: any) {
  try {
    let path = req.url?.split('?')[0] ?? '';
    const fullUrl = req.url ?? '';
    const qIndex = fullUrl.indexOf('?');
    const queryString = qIndex >= 0 ? fullUrl.slice(qIndex + 1) : '';
    const params = new URLSearchParams(queryString);
    const pathSegment = params.get('path');
    if (pathSegment) {
      path = '/api/' + pathSegment.replace(/^\/+/, '');
      params.delete('path');
      const rest = params.toString();
      req.url = path + (rest ? '?' + rest : '');
    } else {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
          path = new URL(path).pathname;
        } catch {
          path = '';
        }
      }
      if (!path.startsWith('/')) path = '/' + path;
      if (!path.startsWith('/api')) path = '/api' + path;
      req.url = path + (queryString ? '?' + queryString : '');
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
