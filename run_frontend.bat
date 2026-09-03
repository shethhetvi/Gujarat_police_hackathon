@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: SentinelGrid Frontend Configuration
:: ============================================================================
set "APP_NAME=SentinelGrid"
set "FRONTEND_PORT=3000"
set "ROOT_DIR=%~dp0"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

title %APP_NAME% Frontend (Port %FRONTEND_PORT%)
cd /d "%FRONTEND_DIR%"

echo ============================================================================
echo   Starting %APP_NAME% Command Center UI (Next.js)
echo   Port: %FRONTEND_PORT%  ^|  URL: http://localhost:%FRONTEND_PORT%
echo ============================================================================

npm run dev
pause
