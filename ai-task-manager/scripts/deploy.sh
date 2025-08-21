#!/bin/bash

echo "🚀 Deploy TaskAI para Produção"
echo "==============================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Check environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY não configurada. Configure a variável de ambiente:"
    echo "export OPENAI_API_KEY=sua-chave-aqui"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET não configurada. Usando valor padrão (não recomendado para produção)."
    export JWT_SECRET="production-jwt-secret-change-this"
fi

echo "📦 Construindo imagens Docker..."
docker-compose build

echo "🚀 Iniciando serviços..."
docker-compose up -d

echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Check if services are healthy
echo "🔍 Verificando status dos serviços..."
docker-compose ps

echo "✅ Deploy concluído!"
echo ""
echo "🌐 URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001/api"
echo "Health Check: http://localhost:3001/health"
echo ""
echo "📊 Para ver logs:"
echo "docker-compose logs -f"
echo ""
echo "🛑 Para parar:"
echo "docker-compose down"