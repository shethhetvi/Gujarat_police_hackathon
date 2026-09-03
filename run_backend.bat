@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: SentinelGrid Backend Configuration
:: ============================================================================
set "APP_NAME=SentinelGrid"
set "BACKEND_HOST=0.0.0.0"
set "BACKEND_PORT=8000"
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"

:: Auto-detect Python Virtual Environment
set "PYTHON_CMD=python"
if exist "%BACKEND_DIR%\venv\Scripts\python.exe" (
    set "PYTHON_CMD=%BACKEND_DIR%\venv\Scripts\python.exe"
) else if exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON_CMD=%BACKEND_DIR%\.venv\Scripts\python.exe"
) else if exist "%ROOT_DIR%venv\Scripts\python.exe" (
    set "PYTHON_CMD=%ROOT_DIR%venv\Scripts\python.exe"
) else if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    set "PYTHON_CMD=%ROOT_DIR%.venv\Scripts\python.exe"
)

title %APP_NAME% Backend (Port %BACKEND_PORT%)
cd /d "%BACKEND_DIR%"

echo ============================================================================
echo   Starting %APP_NAME% AI Video Analytics Engine (FastAPI)
echo   Port: %BACKEND_PORT%  ^|  Docs: http://localhost:%BACKEND_PORT%/docs
echo   Python: %PYTHON_CMD%
echo ============================================================================

"%PYTHON_CMD%" -m uvicorn app.main:app --reload --host %BACKEND_HOST% --port %BACKEND_PORT%
pause
