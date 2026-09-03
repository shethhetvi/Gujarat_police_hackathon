@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: SentinelGrid Platform Configuration
:: ============================================================================
set "APP_NAME=SentinelGrid"
set "APP_TAGLINE=Gujarat Police Automated CCTV Intelligence Platform"
set "BACKEND_HOST=0.0.0.0"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=3000"

:: Paths
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

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

title %APP_NAME% - Full Stack Launcher

echo ============================================================================
echo   %APP_NAME% - %APP_TAGLINE%
echo ============================================================================
echo.
echo [1/3] Checking environment pre-requisites...

:: Verify Directories
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend folder not found at: %BACKEND_DIR%
    pause
    exit /b 1
)
if not exist "%FRONTEND_DIR%" (
    echo [ERROR] Frontend folder not found at: %FRONTEND_DIR%
    pause
    exit /b 1
)

echo [2/3] Spawning %APP_NAME% Backend (FastAPI :%BACKEND_PORT%)...
start "%APP_NAME% Backend (Port %BACKEND_PORT%)" cmd /k "cd /d "%BACKEND_DIR%" && title %APP_NAME% Backend && echo Starting %APP_NAME% FastAPI server on port %BACKEND_PORT%... && "%PYTHON_CMD%" -m uvicorn app.main:app --reload --host %BACKEND_HOST% --port %BACKEND_PORT%"

echo [3/3] Spawning %APP_NAME% Frontend (Next.js :%FRONTEND_PORT%)...
start "%APP_NAME% Frontend (Port %FRONTEND_PORT%)" cmd /k "cd /d "%FRONTEND_DIR%" && title %APP_NAME% Frontend && echo Starting %APP_NAME% Next.js UI on port %FRONTEND_PORT%... && npm run dev"

echo.
echo ============================================================================
echo   %APP_NAME% Services Active:
echo   - Web Console:       http://localhost:%FRONTEND_PORT%
echo   - Backend REST API:  http://localhost:%BACKEND_PORT%
echo   - Interactive Docs:  http://localhost:%BACKEND_PORT%/docs
echo ============================================================================
echo.
echo Keep the launched terminal windows open while testing.
echo Press any key to close this launcher window.
pause >nul
