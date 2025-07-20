#!/bin/bash

echo "Setting up Integrated Diary Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is required but not installed."
    exit 1
fi

echo "Installing backend dependencies..."

# Setup backend
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python packages..."
pip3 install -r requirements.txt

cd ..

echo "Installing frontend dependencies..."

# Setup frontend
cd frontend

# Install Node.js dependencies
echo "Installing Node.js packages..."
npm install

cd ..

echo "Setup complete!"
echo ""
echo "To start the application:"
echo "1. Make sure you have API keys configured in backend/app.py"
echo "2. Run: ./start.sh"
echo ""
echo "For Google Calendar integration (optional):"
echo "1. Follow the setup guide in GOOGLE_CALENDAR_SETUP.md"
echo "2. Place credentials.json in the backend/ directory"
echo ""
echo "Or start manually:"
echo "1. Backend: cd backend && source venv/bin/activate && python app.py"
echo "2. Frontend: cd frontend && npm run dev" 