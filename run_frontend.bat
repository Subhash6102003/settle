@echo off
title Settle Frontend Studio (Vercel Ready)
cd /d "%~dp0frontend"
echo [SETTLE] Starting Frontend on http://localhost:3000 ...
npm run dev
pause
