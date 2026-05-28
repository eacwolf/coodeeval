# Complete AI Question Answering System

A full-stack application with a React frontend and Node.js backend that connects to Claude AI for intelligent question answering.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- Anthropic API key (get one at https://console.anthropic.com/)

### Setup in 5 Minutes

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

Expected output:
```
✅ Backend is running on http://localhost:5000
📡 API available at http://localhost:5000/api/ask
🏥 Health check at http://localhost:5000/health
```

#### 2. Frontend Setup (in another terminal)
```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`

---

## ✅ Verification

### Test Backend Health
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "Backend is working",
  "timestamp": "2025-05-17T..."
}
```

### Test AI Integration
```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is artificial intelligence?"}'
```

You should get an AI-generated answer within seconds.

---

## 📁 Project Structure

```
my-jsx-app/
├── backend/                 # Node.js Express server
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   ├── .env                # Secrets (not in git)
│   └── README.md           # Backend docs
├── src/
│   ├── App.jsx             # React main component
│   ├── main.jsx            # React entry point
│   ├── index.css
│   └── App.css
├── public/                 # Static assets
├── index.html
├── package.json            # Frontend dependencies
├── vite.config.js
└── README.md              # This file
```

---

## 🔌 API Reference

### Ask a Question
**POST** `/api/ask`

**Request:**
```json
{
  "question": "How do I build a scalable database?",
  "system": "You are a helpful assistant." (optional)
}
```

**Response:**
```json
{
  "question": "How do I build a scalable database?",
  "answer": "To build a scalable database, consider: 1) Sharding/Partitioning...",
  "model": "claude-opus-4-1-20250805",
  "usage": {
    "input_tokens": 45,
    "output_tokens": 150
  }
}
```

### Health Check
**GET** `/health`

Verify backend is running. Returns `{ "status": "Backend is working", "timestamp": "..." }`

---

## 🛠️ Development

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend Scripts
```bash
npm run dev      # Start with auto-reload
npm start        # Start server (no auto-reload)
```

---

## 🔐 Security Notes

✅ **What's Secure:**
- API keys stored in `.env` (never committed)
- CORS restricted to localhost/frontend URL
- Backend handles all API calls (not exposed from frontend)

⚠️ **For Production:**
- Use environment variables from deployment platform
- Enable HTTPS
- Implement rate limiting
- Add authentication/authorization
- Use CORS whitelist for allowed domains

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 5000 is free: `netstat -an \| grep 5000` |
| "ANTHROPIC_API_KEY not configured" | Add key to `backend/.env` and restart |
| Frontend can't reach backend | Verify backend is running on `http://localhost:5000/health` |
| API key is invalid | Check key at https://console.anthropic.com/ |
| CORS errors | Ensure `FRONTEND_URL` in `.env` matches your frontend URL |

---

## 📝 Features

✨ **Current:**
- AI-powered question answering
- Claude Opus 4 model
- Real-time responses
- Token usage tracking

🔮 **Possible Enhancements:**
- Multiple AI models support
- Conversation history
- Custom prompts
- Rate limiting
- User authentication
- Response caching
- Batch processing

---

## 📄 License

MIT - Feel free to use this project

---

## 🤝 Support

Having issues? Check:
1. Backend logs in terminal
2. Network tab in browser DevTools
3. `.env` configuration
4. API key validity at https://console.anthropic.com/

Need help? Create an issue or check the backend `README.md` for detailed documentation.
