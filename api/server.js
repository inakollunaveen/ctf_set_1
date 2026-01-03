import crypto from 'crypto';
import cors from 'cors';

export default function handler(req, res) {
  // Enable CORS
  cors()(req, res, () => {});

  // Load the HMAC secret from environment variables
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    console.error('Error: HMAC_SECRET environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Middleware to parse JSON bodies
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        handleRequest(req, res, secret);
      } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } else {
    handleRequest(req, res, secret);
  }
}

function handleRequest(req, res, secret) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Hidden endpoint for the header challenge
  if (req.method === 'GET' && pathname === '/api/hidden') {
    const teamId = url.searchParams.get('team_id');
    const shadowToken = req.headers['x-shadow-token'];

    // Validate required parameters and header
    if (!teamId) {
      return res.status(400).json({ error: 'Missing team_id query parameter' });
    }

    if (shadowToken !== 'open_sesame') {
      return res.status(403).json({ error: 'Forbidden: Invalid or missing X-Shadow-Token header' });
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
    return res.status(200).json({ flag });
  }

  // Endpoint to validate the submitted unique identifier for Round 3 completion
  if (req.method === 'POST' && pathname === '/api/validate-round3') {
    const { teamId, identifier } = req.body || {};

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

    return res.status(200).json({
      success: isValid,
      message: isValid ? 'Round 3 completed successfully!' : 'Invalid identifier. Try again.'
    });
  }

  // Health check endpoint
  if (req.method === 'GET' && pathname === '/api/health') {
    return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  }

  // Not found
  return res.status(404).json({ error: 'Not found' });
}