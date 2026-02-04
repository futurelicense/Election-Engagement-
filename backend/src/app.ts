import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import electionsRoutes from './routes/elections.js';
import candidatesRoutes from './routes/candidates.js';
import votesRoutes from './routes/votes.js';
import newsRoutes from './routes/news.js';
import commentsRoutes from './routes/comments.js';
import chatRoutes from './routes/chat.js';
import settingsRoutes from './routes/settings.js';

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origins = corsOrigin.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: origins,
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

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
