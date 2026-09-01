#!/usr/bin/env bash
set -e

echo "===================================================="
echo "    SentinelGrid Project Setup & Initialization    "
echo "===================================================="

# Backend setup
echo "[1/3] Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Frontend setup
echo "[2/3] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "[3/3] Initialization complete!"
echo "Run 'docker-compose up --build' to start all services, or run backend and frontend separately."
