@echo off
title SentinelGrid Full Stack Launcher
echo ========================================================
echo   Launching Gujarat Police SentinelGrid Platform...
echo ========================================================
start "SentinelGrid Backend (Port 8000)" cmd /k "cd /d %~dp0\backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
start "SentinelGrid Frontend (Port 3000)" cmd /k "cd /d %~dp0\frontend && npm run dev"
echo.
echo Both services launched in separate terminal windows:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
pause
