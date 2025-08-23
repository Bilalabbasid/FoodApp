@echo off
echo Cleaning all caches and restarting development servers...

REM Kill all Node.js processes
taskkill /f /im node.exe >nul 2>&1

REM Clean Vite cache
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"
if exist "dist" rmdir /s /q "dist"

echo Cache cleaned. Starting backend...
cd server
start "Backend Server" cmd /k "npm run dev:simple"

echo Starting frontend...
cd ..
timeout /t 3 >nul
start "Frontend Server" cmd /k "npm run dev"

echo Both servers starting...
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:5173
pause
