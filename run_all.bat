@echo off
title Settle Launcher
echo ===================================================
echo          SETTLE — Zero AI Billing Engine
echo ===================================================
echo Starting Backend on http://localhost:5000 ...
start "Settle Backend" cmd /k "cd /d %~dp0backend && npx tsx src/server.ts"

timeout /t 2 /nobreak > nul

echo Starting Frontend on http://localhost:3000 ...
start "Settle Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Settle is now running!
echo - Dashboard: http://localhost:3000
echo - Demo Proposal: http://localhost:3000/p/acme-brand-refresh-2026
echo - Backend API: http://localhost:5000
echo ===================================================
pause
