#!/bin/bash
# Setup script for Mac/Linux

echo "========================================"
echo "Django Backend Setup"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

echo "Step 1: Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo "Step 2: Activating virtual environment..."
source venv/bin/activate

echo "Step 3: Upgrading pip..."
pip install --upgrade pip

echo "Step 4: Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "Step 5: Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env file created. Please edit it with your configuration."
else
    echo ".env file already exists. Skipping..."
fi

echo "Step 6: Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: ./run.sh to start the development server"
echo "3. Visit: http://localhost:8000/api/"
echo
