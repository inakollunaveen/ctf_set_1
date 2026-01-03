import crypto from 'crypto';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Load the HMAC secret from environment variables
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    console.error('Error: HMAC_SECRET environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

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
    message: isValid ? 'Round 3 completed successfully!' : 'Invalid identifier. Try again.',
    valid: isValid
  });
}