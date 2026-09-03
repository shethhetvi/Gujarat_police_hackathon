@echo off
title SentinelGrid Backend (FastAPI :8000)
cd /d "%~dp0\backend"
echo ========================================================
echo   Starting SentinelGrid AI Video Analytics Engine...
echo   Port: 8000 (FastAPI Swagger Docs: http://localhost:8000/docs)
echo ========================================================
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
