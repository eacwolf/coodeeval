# 🚀 Complete Installation & Setup Guide

This guide will help you set up the AI Question Answering System with a working backend and frontend.

---

## ✅ Step 1: Get Your API Key (5 minutes)

1. Go to https://console.anthropic.com/
2. Create an account or log in
3. Click on **API Keys** in the left sidebar
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. **Save it somewhere safe** - you'll need it in the next step

> **Free Trial**: New Anthropic accounts get free credits to test the API.

---

## ✅ Step 2: Setup Backend (5 minutes)

### Option A: Automatic Setup (Recommended for Windows)

1. Navigate to the project folder in PowerShell
2. Run:
   ```powershell
   .\start-all.ps1
   ```
3. This will automatically:
   - Install backend dependencies
   - Create `.env` file
   - Start both servers

### Option B: Manual Setup

#### 2.1 Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2.2 Configure Environment Variables
```bash
# Copy the template
cp .env.example .env

# Edit the file and add your API key
# backend/.env should look like:
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### 2.3 Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Backend is running on http://localhost:5000
📡 API available at http://localhost:5000/api/ask
🏥 Health check at http://localhost:5000/health
```

---

## ✅ Step 3: Verify Backend is Working

In a **new terminal**, test the backend:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "Backend is working",
  "timestamp": "2025-05-17T..."
}
```

---

## ✅ Step 4: Start Frontend (5 minutes)

Open a **new terminal** in the project root and run:

```bash
npm install
npm run dev
```

You should see:
```
VITE v7.3.1  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Press r + enter to restart, q to quit
```

---

## ✅ Step 5: Test the Connection

1. Open http://localhost:5173 in your browser
2. Go to Admin Settings (⚙️)
3. You should see an indication that the backend is working
4. Try asking a question - it should call your backend and get an AI response!

---

## 🎯 Quick Verification Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Backend health check returns status
- [ ] Frontend running on `http://localhost:5173`
- [ ] `.env` file has your ANTHROPIC_API_KEY
- [ ] Frontend can communicate with backend
- [ ] Asking a question returns an AI response

---

## 🔧 Troubleshooting

### "Cannot find module" error
```bash
cd backend
npm install
```

### Port 5000 already in use
```bash
# Windows - find what's using port 5000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000

# Or change the port in backend/.env
PORT=5001
```

### API Key Error
1. Verify key starts with `sk-ant-`
2. Check it's in `backend/.env`
3. Visit https://console.anthropic.com/ to verify it's valid
4. Check you have API credits remaining

### CORS Error in Browser Console
- Verify backend is running
- Check `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Restart backend server

### Frontend can't reach backend
1. Check backend is running: `curl http://localhost:5000/health`
2. If backend is different port, update `callLLM` function in `src/App.jsx`
3. Check browser Network tab (DevTools) for actual error

---

## 📚 What Happens Next?

### In the Frontend
- Go to **Challenge Builder** to create coding challenges
- Use **AI Generate** to create problem statements
- The questions get sent to your backend
- Your backend connects to Claude AI and returns answers

### In the Backend
- `/api/ask` endpoint accepts questions
- Connects to Anthropic Claude API
- Returns AI-generated answers with token usage
- Handles all API key management securely

---

## 🎓 Understanding the Flow

```
┌─────────────┐
│   Browser   │
│ (Frontend)  │
└──────┬──────┘
       │ asks question
       ▼
┌─────────────────┐
│  Express Server │  ← Backend running on localhost:5000
│   (Node.js)     │
└──────┬──────────┘
       │ sends request
       ▼
┌─────────────────┐
│ Anthropic API   │ ← Claude AI Model
│  (Cloud)        │
└──────┬──────────┘
       │ returns answer
       ▼
┌─────────────────┐
│  Express Server │
└──────┬──────────┘
       │ returns answer
       ▼
┌─────────────┐
│   Browser   │ ← User sees answer
└─────────────┘
```

---

## 💡 Tips for Success

1. **Keep terminal windows open** - Both frontend and backend need to keep running
2. **Check the console** - Backend console shows API requests and errors
3. **Browser DevTools** - Use Network tab to see API calls
4. **Start simple** - Test with `curl` before using the UI
5. **Keep your API key safe** - Never commit `.env` to git

---

## 🚀 Next Steps

Once everything is working:

1. **Deploy the backend** (Heroku, Railway, AWS, etc.)
2. **Deploy the frontend** (Vercel, Netlify, etc.)
3. **Update frontend URL** in backend `.env`
4. **Add more features** (caching, history, multiple models)
5. **Optimize costs** (batching, caching, rate limiting)

---

## 📞 Getting Help

If something isn't working:

1. Check the backend terminal for errors
2. Check browser console (F12) for errors
3. Test the backend directly with curl
4. Verify `.env` configuration
5. Check the logs and error messages carefully

**Common errors and solutions are in `backend/README.md`**

---

## ✨ You're All Set!

Your AI Question Answering System is now ready to use. The backend will:
- ✅ Accept questions via HTTP
- ✅ Connect to Claude AI
- ✅ Return intelligent answers
- ✅ Track token usage
- ✅ Handle errors gracefully

Happy coding! 🎉
