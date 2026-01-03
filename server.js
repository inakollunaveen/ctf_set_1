import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ MUST use Render port
const PORT = process.env.PORT || 10000;

// ✅ Enable CORS (safe since frontend is same origin)
app.use(cors());

// Load HMAC secret
const secret = process.env.HMAC_SECRET;
if (!secret) {
  console.error('❌ HMAC_SECRET environment variable is not set');
  process.exit(1);
}

app.use(express.json());

// ✅ Serve React build
app.use(express.static(path.join(__dirname, 'dist')));

// ---------------- API ROUTES ----------------

// Hidden endpoint
app.get('/api/hidden', (req, res) => {
  const teamId = req.query.team_id;
  const shadowToken = req.headers['x-shadow-token'];

  if (!teamId) {
    return res.status(400).json({ error: 'Missing team_id query parameter' });
  }

  if (shadowToken !== 'open_sesame') {
    return res.status(403).json({ error: 'next-path-header-name:X-Shadow-Token' });
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(teamId);
  const digest = hmac.digest('hex');

  const uniqueIdentifier = digest.substring(0, 12);
  const flag = `flag{shadowbreak_mission_${teamId}_${uniqueIdentifier}}`;

  res.json({ flag });
});

// Round 3 validation
app.post('/api/validate-round3', (req, res) => {
  const { teamId, identifier } = req.body;

  if (!teamId || !identifier) {
    return res.status(400).json({ error: 'Missing teamId or identifier' });
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(teamId);
  const digest = hmac.digest('hex');
  const expectedIdentifier = digest.substring(0, 12);

  res.json({
    success: identifier === expectedIdentifier,
    message:
      identifier === expectedIdentifier
        ? 'Round 3 completed successfully!'
        : 'Invalid identifier. Try again.'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ---------------- SPA FALLBACK ----------------

// ✅ Required for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ---------------- START SERVER ----------------

// ✅ MUST bind to 0.0.0.0 on Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CTF Server running on port ${PORT}`);
  console.log('Serving frontend + API');
});