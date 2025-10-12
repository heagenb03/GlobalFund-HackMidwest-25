@echo off
echo.
echo ====================================
echo   GlobalFund - Full Stack Startup
echo ====================================
echo.

REM Start backend
echo [1/2] Starting Django Backend...
start cmd /k "cd backapp && .\venv\Scripts\activate && python manage.py runserver 8000"

timeout /t 3 /nobreak >nul

REM Start frontend
echo [2/2] Starting Next.js Frontend...
start cmd /k "cd frontapp && npm run dev"

echo.
echo ====================================
echo   Both services are starting!
echo ====================================
echo.
echo Backend:  http://localhost:8000/api/
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit (services will keep running)
pause >nul
