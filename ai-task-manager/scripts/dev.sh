#!/bin/bash

echo "🚀 Iniciando TaskAI em modo desenvolvimento..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to call cleanup on script exit
trap cleanup EXIT INT TERM

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "❌ Arquivo backend/.env não encontrado. Execute ./scripts/setup.sh primeiro."
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "❌ Arquivo frontend/.env não encontrado. Execute ./scripts/setup.sh primeiro."
    exit 1
fi

# Start backend
echo "🔧 Iniciando backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Iniciando frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Serviços iniciados!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:3001"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços."

# Wait for processes
wait