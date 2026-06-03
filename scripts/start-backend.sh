#!/bin/bash

cd "$(dirname "$0")"

echo "🥋 Taekwondo Scoring System - Backend Server"
echo "============================================"
echo ""

if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

echo "🚀 Starting backend server on port 5000..."
echo "Press Ctrl+C to stop"
echo ""

cd backend
node server.js
