# 🚀 Guia de Início Rápido - TaskAI

## ⚡ Setup em 5 Minutos

### 1. Pré-requisitos
- Node.js 16+ instalado
- MongoDB rodando (local ou Docker)
- Chave da API OpenAI

### 2. Instalação Automática
```bash
# Clone o projeto
git clone <repository-url>
cd ai-task-manager

# Execute o setup automático
npm run setup
```

### 3. Configuração Rápida
```bash
# Configure a chave OpenAI no backend
echo "OPENAI_API_KEY=sua-chave-aqui" >> backend/.env
echo "JWT_SECRET=minha-chave-secreta-jwt" >> backend/.env
```

### 4. Iniciar Desenvolvimento
```bash
# Inicia backend e frontend simultaneamente
npm run dev
```

## 🎯 Teste Rápido

### Criando seu Primeiro Quadro
1. Acesse http://localhost:3000
2. Registre uma conta
3. Clique em "Novo Quadro"
4. Digite "Meu Projeto" como título

### Testando a IA
1. Adicione uma tarefa: "Corrigir bug crítico no sistema de login"
2. Clique no ícone ✨ (Sugestões de IA)
3. Veja as sugestões automáticas de prioridade e prazo
4. Clique em "Melhorar com IA" na descrição

### Drag & Drop
1. Crie algumas tarefas
2. Arraste entre as listas (To Do → In Progress → Done)
3. Veja as atualizações em tempo real

## 🐳 Deploy com Docker (Ainda Mais Rápido)

```bash
# Configure variáveis de ambiente
export OPENAI_API_KEY=sua-chave-aqui
export JWT_SECRET=sua-chave-jwt

# Deploy completo
npm run docker:up
```

Acesse: http://localhost:3000

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia frontend + backend
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend

# Build
npm run build:all        # Build completo
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend

# Docker
npm run docker:build     # Constrói imagens
npm run docker:up        # Inicia containers
npm run docker:down      # Para containers
npm run docker:logs      # Ver logs

# Instalação
npm run install:all      # Instala todas as dependências
npm run setup            # Setup completo do projeto
```

## 🎉 Pronto!

Seu gerenciador de tarefas com IA está funcionando!

**URLs Importantes:**
- 🌐 App: http://localhost:3000
- 🔗 API: http://localhost:3001/api
- 📊 Health: http://localhost:3001/health

**Próximos Passos:**
1. Explore as funcionalidades de IA
2. Crie múltiplos quadros
3. Convide membros para colaborar
4. Acompanhe suas métricas de produtividade

---

💡 **Dica**: Use tarefas com palavras como "urgente", "crítico", "importante" para ver a IA em ação!