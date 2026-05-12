import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagnoseRunner, runKotlin } from './runner.js';
import { validatePayload } from './validation.js';

const app = express();
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(SERVER_DIR, '..', 'dist');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : '*',
}));
app.use(express.json({ limit: '512kb' }));

app.post('/run', async (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await runKotlin(req.body);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.startsWith('ENVIRONMENT') ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.get('/runner-diagnostics', async (_req, res) => {
  try {
    res.json(await diagnoseRunner());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`KRunner server listening on port ${PORT}`);
});
