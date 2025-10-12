@echo off
REM Start Django development server

echo Starting Django backend...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if migrations are needed
python manage.py migrate --check >nul 2>&1
if errorlevel 1 (
    echo Running pending migrations...
    python manage.py migrate
)

REM Start server
echo Server will be available at: http://localhost:8000/api/
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver 8000
