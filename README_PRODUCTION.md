# CTF Application - Production Deployment

This is a complete CTF (Capture The Flag) application with React frontend and Node.js/Express backend, deployed as a single server.

## Features
- 3 rounds of challenges (ROT13, Caesar cipher, Header challenge)
- Scoring system with hint penalties (-5 marks per hint)
- Secure flag generation using HMAC-SHA256
- Single-server deployment on one port

## Production Setup

### 1. Environment Variables
Create a `.env` file in the root directory:
```
HMAC_SECRET=your_secure_random_secret_here
PORT=3000
```

### 2. Build the React Frontend
```bash
npm run build
```
This creates a `dist/` folder with optimized static files.

### 3. Start the Production Server
```bash
npm start
```
The server will:
- Serve React static files from `dist/`
- Handle API requests under `/api/*`
- Support SPA routing with fallback to `index.html`

### 4. Access the Application
Open `http://localhost:3000` in your browser.

## API Endpoints
- `GET /api/hidden?team_id=<id>` - Header challenge (requires X-Shadow-Token)
- `POST /api/validate-round3` - Validate Round 3 identifier
- `GET /api/health` - Health check

## Development
For development with separate servers:
```bash
# Terminal 1: Backend
$env:HMAC_SECRET="secret"; node server.js

# Terminal 2: Frontend
npm run dev
```

## Deployment Notes
- All API calls use relative paths (e.g., `/api/validate-round3`)
- Static files are cached for performance
- SPA routing ensures all routes serve `index.html`
- Secure HMAC-based flag generation prevents guessing</content>
<parameter name="filePath">c:\Users\vamsi\Downloads\mission-brief-ctf\README.md