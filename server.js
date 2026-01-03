import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5009;

// Enable CORS for development (optional in production if same origin)
app.use(cors());

// Load the HMAC secret from environment variables
const secret = process.env.HMAC_SECRET;
if (!secret) {
  console.error('Error: HMAC_SECRET environment variable is not set. Please set it to a secure random string.');
  process.exit(1);
}

// Middleware to parse JSON bodies for POST requests
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// API Endpoints

// Hidden endpoint for the header challenge
app.get('/api/hidden', (req, res) => {
  const teamId = req.query.team_id;
  const shadowToken = req.headers['x-shadow-token'];

  // Validate required parameters and header
  if (!teamId) {
    return res.status(400).json({ error: 'Missing team_id query parameter' });
  }

  if (shadowToken !== 'open_sesame') {
    return res.status(403).json({ error: 'next-path-header-name:X-Shadow-Token' });
  }

  // Generate deterministic HMAC-SHA256 digest for the team_id
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(teamId);
  const digest = hmac.digest('hex');

  // Extract the first 12 characters of the digest as the unique identifier
  const uniqueIdentifier = digest.substring(0, 12);

  // Construct the flag in the required format
  const flag = `flag{shadowbreak_mission_${teamId}_${uniqueIdentifier}}`;

  // Return the flag preview
  res.json({ flag });
});

// Endpoint to validate the submitted unique identifier for Round 3 completion
app.post('/api/validate-round3', (req, res) => {
  const { teamId, identifier } = req.body;

  // Validate input
  if (!teamId || !identifier) {
    return res.status(400).json({ error: 'Missing teamId or identifier in request body' });
  }

  // Generate the expected identifier using the same HMAC logic
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(teamId);
  const digest = hmac.digest('hex');
  const expectedIdentifier = digest.substring(0, 12);

  // Check if the submitted identifier matches the expected one
  const isValid = identifier === expectedIdentifier;

  res.json({
    success: isValid,
    message: isValid ? 'Round 3 completed successfully!' : 'Invalid identifier. Try again.'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`CTF Production Server running on port ${port}`);
  console.log('Serving React frontend and API endpoints');
  console.log('Ensure HMAC_SECRET is set in your environment variables.');
});