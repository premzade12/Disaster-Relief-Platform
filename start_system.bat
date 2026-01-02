@echo off
echo Starting Disaster Assessment System...
echo.

echo Installing React dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install React dependencies
    pause
    exit /b 1
)

echo.
echo Starting React development server...
start "React Frontend" cmd /k "npm start"

echo.
echo Waiting for React server to start...
timeout /t 5 /nobreak > nul

cd ..\Flask
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Starting Flask backend server...
start "Flask Backend" cmd /k "python app_working.py"

echo.
echo Both servers are starting...
echo React Frontend: http://localhost:3000
echo Flask Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul