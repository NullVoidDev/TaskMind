#!/bin/bash

echo "🚀 Configurando TaskAI - Gerenciador de Tarefas com IA"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 16+ primeiro."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB não encontrado. Instalando via Docker..."
    if command -v docker &> /dev/null; then
        docker run -d -p 27017:27017 --name mongodb mongo:latest
        echo "✅ MongoDB iniciado via Docker"
    else
        echo "❌ Por favor, instale MongoDB ou Docker primeiro."
        exit 1
    fi
fi

echo "📦 Instalando dependências do backend..."
cd backend
npm install

echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

echo "🔧 Configurando arquivos de ambiente..."
cd ../backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado no backend. Configure suas variáveis!"
fi

cd ../frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado no frontend."
fi

echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure sua OPENAI_API_KEY no backend/.env"
echo "2. Configure JWT_SECRET no backend/.env"
echo "3. Execute 'npm run dev' no diretório backend"
echo "4. Execute 'npm start' no diretório frontend"
echo ""
echo "🌐 URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001/api"
echo "Health Check: http://localhost:3001/health"