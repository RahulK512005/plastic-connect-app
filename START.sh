#!/bin/bash

echo "🚀 Starting Plastic Connect..."
echo ""

# Start backend in background
echo "📦 Starting Backend (port 5000)..."
cd backend
npm start &
BACKEND_PID=$!
sleep 3

# Start frontend
echo "⚛️  Starting Frontend (port 3000)..."
cd ../frontend
echo ""
echo "✅ Plastic Connect is starting!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:5000"
echo ""
echo "🔐 Login with:"
echo "   - Email: test@collector.com"
echo "   - Role: Collector"
echo "   - Password: password123"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

npm start

# Kill backend when frontend stops
kill $BACKEND_PID
