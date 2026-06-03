#!/bin/bash

cd "$(dirname "$0")"

echo "🥋 Taekwondo Scoring System - Frontend"
echo "======================================"
echo ""

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  echo "This may take a few minutes..."
  cd frontend
  npm install
  cd ..
fi

echo "🚀 Starting frontend on http://localhost:3000..."
echo "Press Ctrl+C to stop"
echo ""

cd frontend
npm start
