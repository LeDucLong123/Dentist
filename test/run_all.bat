@echo off
echo =====================================================================
echo   AUTOMATED TESTING SYSTEM - CLINIC APP
echo =====================================================================
echo.

:: 1. Check if Next.js server is running on port 3000
echo [*] Checking port 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo [OK] Clinic Server is already running at http://localhost:3000.
) else (
    echo [!] Server not running. Starting Clinic Server in background...
    start "DentistApp" /B cmd /c "cd /d ..\dentist\dentist-app && pnpm dev"
    echo [*] Waiting 15 seconds for server initialization...
    timeout /t 15 /nobreak > nul
)

:: 2. Run Playwright Test Suite
echo.
echo [*] Starting all E2E test cases (Functional + Security)...
call npx playwright test --project=chromium --headed

:: 3. Open Report
echo.
echo [OK] Testing completed. Opening HTML Report...
call npx playwright show-report
pause
