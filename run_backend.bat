@echo off
title Settle Backend API (Zero AI Inside)
cd /d "%~dp0backend"
echo [SETTLE] Starting Backend API on http://localhost:5000 ...
npx tsx src/server.ts
pause
