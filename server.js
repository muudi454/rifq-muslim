import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const DIST = path.join(__dirname, 'dist');

app.disable('x-powered-by');

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'rifq-muslim',
    time: new Date().toISOString(),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL),
  });
});

if (!fs.existsSync(DIST)) {
  app.get('/', (_req, res) => {
    res
      .status(503)
      .type('text/plain')
      .send('Build output missing. Run "npm run build" before "npm start".');
  });
} else {
  // Long-lived caching for immutable assets and Islamic data files.
  app.use(
    '/assets',
    express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y' }),
  );
  app.use(
    '/data',
    express.static(path.join(DIST, 'data'), { maxAge: '7d', setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } }),
  );
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));

  // Single-page-app fallback, including the root path.
  app.get('/', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(DIST, 'index.html'));
  });

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RIFQ Muslim listening on http://0.0.0.0:${PORT}`);
});
