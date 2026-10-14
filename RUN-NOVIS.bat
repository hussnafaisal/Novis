@echo off
cd /d %~dp0
call npm install
if errorlevel 1 (
  echo npm install failed. Check your internet connection and Node.js installation.
  pause
  exit /b 1
)
call npm run dev
