# Backend Setup Guide

## Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Get your API key:**
- Visit https://console.anthropic.com/
- Create an account or log in
- Go to API Keys section
- Create a new API key and copy it

### 3. Start the Backend Server
```bash
npm run dev
```

You should see:
```
✅ Backend is running on http://localhost:5000
📡 API available at http://localhost:5000/api/ask
🏥 Health check at http://localhost:5000/health
```

### 4. Test the Backend (in another terminal)
```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is 2+2?"}'
```

You should get a response like:
```json
{
  "question": "What is 2+2?",
  "answer": "2+2 equals 4.",
  "model": "claude-opus-4-1-20250805",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 5
  }
}
```

### 5. Start the Frontend (in another terminal)
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## API Endpoints

### POST /api/ask
Ask the AI a question and get an answer.

**Request:**
```json
{
  "question": "Your question here",
  "system": "Custom system prompt (optional)"
}
```

**Response:**
```json
{
  "question": "Your question here",
  "answer": "The AI's response",
  "model": "claude-opus-4-1-20250805",
  "usage": {
    "input_tokens": 100,
    "output_tokens": 50
  }
}
```

### GET /health
Check if the backend is running.

**Response:**
```json
{
  "status": "Backend is working",
  "timestamp": "2025-05-17T10:30:45.123Z"
}
```

---

## Troubleshooting

### "Backend is not running"
- Make sure you're in the `backend` folder
- Run `npm run dev` to start the server
- Check that port 5000 is not in use

### "ANTHROPIC_API_KEY is not configured"
- Check that `.env` file exists in the `backend` folder
- Verify the ANTHROPIC_API_KEY is set correctly
- Restart the backend server

### "Failed to process your question"
- Check your API key is valid at https://console.anthropic.com/
- Verify you have remaining API credits
- Check the backend console for error messages

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check CORS settings - FRONTEND_URL should match your frontend URL
- If using a different port, update the BACKEND_URL in `src/App.jsx`

---

## Production Setup

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ai-backend"
   pm2 save
   pm2 startup
   ```

3. Use a reverse proxy like nginx or deploy to platforms like:
   - Vercel
   - Heroku
   - Railway
   - AWS Lambda with serverless framework

4. Set environment variables securely in your deployment platform's settings
