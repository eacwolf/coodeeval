#!/usr/bin/env pwsh

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "AI Question Answering System Startup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend/.env exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ ERROR: backend/.env not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run setup first:" -ForegroundColor Yellow
    Write-Host "1. cd backend"
    Write-Host "2. Copy .env.example to .env"
    Write-Host "3. Edit .env and add your ANTHROPIC_API_KEY"
    Write-Host "4. cd .."
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting Backend Server..." -ForegroundColor Green

# Start backend in a new window
$backendScript = {
    Set-Location "backend"
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    & npm install
    Write-Host "Starting backend..." -ForegroundColor Green
    & npm run dev
}
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendScript

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Frontend Development Server..." -ForegroundColor Green

# Start frontend in a new window
$frontendScript = {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    & npm install
    Write-Host "Starting frontend..." -ForegroundColor Green
    & npm run dev
}
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:   http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Wait 30 seconds for both servers to start fully..." -ForegroundColor Cyan
