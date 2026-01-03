import crypto from 'crypto';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shadow-Token');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Load the HMAC secret from environment variables
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    console.error('Error: HMAC_SECRET environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const teamId = req.query.team_id;
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

  // Return the flag
  return res.status(200).json({ flag });
}