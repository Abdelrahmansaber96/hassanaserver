@echo off
echo Starting Animal Vaccination Dashboard...
echo.

echo [1/2] Starting Backend Server...
start /B "Backend Server" cmd /c "cd /d \"%~dp0\" && node src/server.js"

echo [2/2] Starting Frontend Client...
start /B "Frontend Client" cmd /c "cd /d \"%~dp0\\client\" && npm start"

echo.
echo ✅ Both servers are starting...
echo 🔗 Backend:  http://localhost:3000
echo 🔗 Frontend: http://localhost:3001
echo.
echo Press any key to close this window...
pause >nul