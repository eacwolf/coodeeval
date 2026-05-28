#!/bin/bash

echo ""
echo "===================================="
echo "AI Question Answering System Startup"
echo "===================================="
echo ""

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ ERROR: backend/.env not found!"
    echo ""
    echo "Please run setup first:"
    echo "1. cd backend"
    echo "2. cp .env.example .env"
    echo "3. Edit .env and add your ANTHROPIC_API_KEY"
    echo "4. cd .."
    echo ""
    read -p "Press Enter to exit"
    exit 1
fi

echo "Starting Backend Server..."
# Start backend in background
(cd backend && npm install && npm run dev) &
BACKEND_PID=$!

sleep 3

echo ""
echo "Starting Frontend Development Server..."
# Start frontend in background
(npm install && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "===================================="
echo "✅ Both servers are starting!"
echo "===================================="
echo ""
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:5000"
echo ""
echo "Processes running:"
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers, press Ctrl+C"
echo ""

# Wait for both processes
wait
