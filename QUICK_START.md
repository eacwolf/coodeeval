# Quick Start Guide - LLM Integration Fixed ✅

## What Was Fixed
The frontend's `callLLM()` function now properly handles:
- ✅ HTTP error status responses (4xx, 5xx)
- ✅ Network connection failures with clear error messages
- ✅ API response validation
- ✅ Better error reporting for debugging
- ✅ Email verification with Resend
- ✅ User authentication with JWT

## Setup Instructions

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Configure Backend Environment Variables

**Copy the example .env file:**
```bash
cd backend

# Copy example file
cp .env.example .env   # (or on Windows: copy .env.example .env)
```

**Edit backend/.env and add your keys:**
```
# Required for AI features
ANTHROPIC_API_KEY=sk-ant-xxxxx...

# Required for authentication (set a strong secret)
JWT_SECRET=your_secret_key_here_change_in_production

# Required for email verification (get from https://resend.com)
RESEND_API_KEY=re_xxxxx...

# Optional
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Getting Resend API Key:**
1. Go to https://resend.com
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file as `RESEND_API_KEY`

### Step 3: Start Backend Server

Open terminal in project root:
```bash
npm run backend
# OR
cd backend && npm run dev
```

You should see:
```
✅ Backend is running on http://localhost:5000
📡 API available at http://localhost:5000/api/ask
```

### Step 4: Start Frontend Server

Open NEW terminal in project root:
```bash
npm run dev
```

You should see:
```
VITE v7.3.1  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Step 5: Configure LLM in Frontend

1. Open http://localhost:5173 in your browser
2. Click **⚙️ Admin Settings** in the left sidebar
3. Fill in:
   - **LLM Provider**: Select your provider (Anthropic Claude, OpenAI, etc.)
   - **API Key**: Paste your API key
   - **Model**: Choose the model version
   - **Max Tokens**: Set to 1024 or higher
4. Click **Save Configuration**
5. You should see green "LLM READY" indicator at bottom of sidebar

### Step 6: Create Questions with LLM

1. Click **🧩 Challenge Builder** in the left sidebar
2. Fill in challenge details (name, role, difficulty, etc.)
3. Click **Generate Problem Statement** - LLM will create it
4. Click **AI Generate Metrics** - LLM will create evaluation criteria
5. Click **Save Challenge**
6. Now you can evaluate code with the LLM

---

## Troubleshooting

### Error: "Cannot connect to backend server"
**Problem**: Backend is not running  
**Solution**:
1. Check terminal where you ran `npm run backend`
2. Make sure it shows "✅ Backend is running on http://localhost:5000"
3. If not, try: `cd backend && npm run dev`
4. On Windows, may need to allow firewall access

### Error: "API key is required"
**Problem**: Frontend is trying to send requests but API key is empty  
**Solution**:
1. Go to ⚙️ Admin Settings
2. Enter your LLM provider API key
3. Click Save Configuration
4. Make sure the green "LLM READY" indicator shows at bottom of sidebar

### Error: "Failed to process your question"
**Problem**: Backend received request but LLM API call failed  
**Solution**:
1. Check if API key is correct
2. Verify you have API credits/quota with provider
3. Check backend terminal for detailed error message
4. Try a different model from the dropdown

### Error: "Invalid API key"
**Problem**: Wrong API key format or invalid key  
**Solution**:
1. Double-check your API key from provider's dashboard
2. Make sure to copy the FULL key without spaces
3. For different providers use keys from correct service:
   - **Anthropic**: sk-ant-xxxxx
   - **OpenAI**: sk-proj-xxxxx
   - **Google Gemini**: From Google Cloud Console
   - **Azure**: Format is endpoint|api-key

### Frontend shows "LLM READY" but still getting errors
**Problem**: API key set but backend calls failing  
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check backend terminal for error details
5. Try generating a simpler question first

### Port 5000 or 5173 already in use
**Problem**: Another application using the ports  
**Solution - Option 1** (Recommended):
```bash
# Kill process on port 5000
# Windows (run as admin)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Solution - Option 2**: Change ports in .env
```
# backend/.env
PORT=5001
```
Then update frontend: `const BACKEND_URL = "http://localhost:5001";`

---

## NPM Scripts

```bash
# Development
npm run dev              # Start frontend (port 5173)
npm run backend         # Start backend (port 5000)
npm run dev:full        # Start both (requires concurrently)

# Production
npm run build           # Build frontend for production
npm run preview         # Preview production build

# Setup
npm run setup           # One-time setup (install all deps + create .env)
npm run backend:setup   # Setup backend only
npm run backend:install # Install backend dependencies
```

---

## Supported LLM Providers

### Anthropic Claude ✅
- Models: `claude-sonnet-4-20250514`, `claude-opus-4-6`
- Key format: `sk-ant-xxxxx...`
- Get key: https://console.anthropic.com

### OpenAI GPT-4o ✅
- Models: `gpt-4o`, `gpt-4o-mini`
- Key format: `sk-proj-xxxxx...`
- Get key: https://platform.openai.com/api-keys

### Google Gemini ✅
- Models: `gemini-2.0-flash`, `gemini-1.5-pro`, etc.
- Key format: (from Google Cloud Console)
- Get key: https://ai.google.dev

### Azure OpenAI ✅
- Requires: `endpoint|api-key` format
- Get keys: https://portal.azure.com

---

## Next Steps

1. ✅ Backend running? Check terminal
2. ✅ Frontend running? Open http://localhost:5173
3. ✅ API key configured? Check Admin Settings
4. ✅ Ready? Create challenges and evaluate code!

## Still Having Issues?

1. **Check backend logs**: Look at terminal where `npm run backend` is running
2. **Check browser console**: Press F12 → Console tab → look for errors
3. **Test health check**: Open http://localhost:5000/health in browser
4. **Verify .env file**: Check `backend/.env` has valid API key
5. **Reinstall dependencies**: `rm -rf node_modules && npm install`

---

**All Set!** 🚀 You should now be able to:
- ✅ Create coding challenges with LLM
- ✅ Generate problem statements automatically
- ✅ Evaluate candidate code with LLM
- ✅ Get detailed scoring and feedback
