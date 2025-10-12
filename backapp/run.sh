#!/bin/bash
# Start Django development server

echo "Starting Django backend..."
echo

# Activate virtual environment
source venv/bin/activate

# Check if migrations are needed
python manage.py migrate --check > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Running pending migrations..."
    python manage.py migrate
fi

# Start server
echo "Server will be available at: http://localhost:8000/api/"
echo "Press Ctrl+C to stop the server"
echo
python manage.py runserver 8000
