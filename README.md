# TaskAI - Gerenciador de Tarefas com Inteligência Artificial

Um aplicativo web moderno de gerenciamento de tarefas inspirado no Trello, mas com integração de inteligência artificial para otimizar a produtividade e organização.

## 🚀 Funcionalidades

### ✨ Principais Recursos
- **Gerenciamento de Quadros**: Crie, edite e delete quadros de tarefas
- **Sistema de Listas**: Organize tarefas em listas customizáveis (To Do, In Progress, Review, Done)
- **Drag & Drop**: Interface intuitiva para mover tarefas entre listas
- **Inteligência Artificial Integrada**:
  - Sugestão automática de prioridades baseada no conteúdo
  - Melhoria de descrições de tarefas para maior clareza
  - Geração de prazos automáticos baseados na complexidade
  - Análise de produtividade personalizada

### 🎯 Funcionalidades de IA
- **Análise de Prioridade**: IA analisa o título e descrição para sugerir prioridade adequada
- **Melhoria de Descrições**: Reescreve descrições para maior clareza e concisão
- **Sugestão de Prazos**: Gera deadlines baseados na complexidade e urgência
- **Score de Produtividade**: Calcula métricas de performance baseadas no histórico

### 📊 Dashboard e Métricas
- Visão geral de todas as tarefas
- Métricas de produtividade em tempo real
- Análise de tarefas por prioridade e status
- Tempo médio de conclusão
- Identificação de tarefas em atraso

### 🔐 Segurança
- Autenticação JWT segura
- Validação de dados no frontend e backend
- Rate limiting para APIs
- Criptografia de senhas com bcrypt

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização moderna
- **@dnd-kit** para funcionalidade drag-and-drop
- **React Router** para navegação
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações

### Backend
- **Node.js** com **Express.js**
- **TypeScript** para type safety
- **MongoDB** com **Mongoose** ODM
- **JWT** para autenticação
- **OpenAI API** para funcionalidades de IA
- **Express Validator** para validação

### Dependências de Segurança
- **Helmet** para headers de segurança
- **CORS** configurado
- **Rate Limiting** implementado
- **bcryptjs** para hash de senhas

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- MongoDB 4.4+
- Conta OpenAI (para funcionalidades de IA)

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd ai-task-manager
```

### 2. Configuração do Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Configure as variáveis de ambiente:
```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-task-manager

# JWT Configuration
JWT_SECRET=sua-chave-jwt-super-secreta-aqui

# OpenAI Configuration
OPENAI_API_KEY=sua-chave-openai-aqui
```

### 3. Configuração do Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Configure as variáveis:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME=TaskAI
```

### 4. Configuração do Banco de Dados

Certifique-se de que o MongoDB está rodando:
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS (com Homebrew)
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🚀 Executando o Projeto

### Desenvolvimento Local

1. **Inicie o Backend**:
```bash
cd backend
npm run dev
```
O servidor estará disponível em `http://localhost:3001`

2. **Inicie o Frontend** (em outro terminal):
```bash
cd frontend
npm start
```
A aplicação estará disponível em `http://localhost:3000`

### Build para Produção

1. **Backend**:
```bash
cd backend
npm run build
npm start
```

2. **Frontend**:
```bash
cd frontend
npm run build
```

## 🌐 Deploy

### Deploy Local com Docker

Crie um `docker-compose.yml` na raiz do projeto:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: ai-task-manager-db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: ai-task-manager-backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/ai-task-manager
      - JWT_SECRET=your-jwt-secret
      - OPENAI_API_KEY=your-openai-key
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: ai-task-manager-frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Execute:
```bash
docker-compose up -d
```

### Deploy em Produção

#### Opções de Deploy:

1. **Vercel** (Frontend) + **Railway/Heroku** (Backend)
2. **Netlify** (Frontend) + **AWS/DigitalOcean** (Backend)
3. **VPS** completo com **Nginx** como proxy reverso

#### Configurações de Produção:

1. Configure variáveis de ambiente de produção
2. Use MongoDB Atlas para banco de dados em nuvem
3. Configure HTTPS com certificados SSL
4. Implemente logs estruturados
5. Configure monitoramento e alertas

## 🔑 Variáveis de Ambiente

### Backend (.env)
| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `PORT` | Porta do servidor | Não (padrão: 3001) |
| `NODE_ENV` | Ambiente de execução | Não (padrão: development) |
| `MONGODB_URI` | String de conexão MongoDB | Sim |
| `JWT_SECRET` | Chave secreta para JWT | Sim |
| `OPENAI_API_KEY` | Chave da API OpenAI | Sim |
| `FRONTEND_URL` | URL do frontend | Não (padrão: http://localhost:3000) |

### Frontend (.env)
| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `REACT_APP_API_URL` | URL da API backend | Sim |
| `REACT_APP_APP_NAME` | Nome da aplicação | Não |

## 📚 Estrutura do Projeto

```
ai-task-manager/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── middleware/      # Middlewares (auth, validação)
│   │   ├── models/          # Modelos do MongoDB
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços (IA, etc.)
│   │   ├── types/           # Definições TypeScript
│   │   ├── utils/           # Utilitários
│   │   └── index.ts         # Entrada principal
│   ├── .env.example
│   └── package.json
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Context API
│   │   ├── services/        # Serviços HTTP
│   │   ├── types/           # Tipos TypeScript
│   │   └── App.tsx          # Componente principal
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🔄 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário

### Quadros
- `GET /api/boards` - Listar quadros
- `POST /api/boards` - Criar quadro
- `GET /api/boards/:id` - Obter quadro específico
- `PUT /api/boards/:id` - Atualizar quadro
- `DELETE /api/boards/:id` - Deletar quadro
- `POST /api/boards/:id/members` - Adicionar membro

### Tarefas
- `GET /api/tasks` - Listar tarefas (com filtros)
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Deletar tarefa
- `POST /api/tasks/:id/improve-description` - Melhorar descrição com IA
- `GET /api/tasks/:id/ai-suggestions` - Obter sugestões de IA

### Dashboard
- `GET /api/dashboard/metrics` - Métricas do dashboard
- `GET /api/dashboard/analytics` - Análises detalhadas

## 🤖 Integração com IA

### Configuração OpenAI
1. Crie uma conta em [OpenAI](https://platform.openai.com/)
2. Gere uma API key
3. Configure a variável `OPENAI_API_KEY` no backend

### Funcionalidades de IA Implementadas
- **Análise de Prioridade**: Usa GPT-3.5-turbo para analisar título e descrição
- **Melhoria de Descrições**: Reescreve descrições para maior clareza
- **Sugestão de Prazos**: Calcula deadlines baseados na complexidade
- **Análise de Complexidade**: Avalia dificuldade da tarefa (1-10)

## 🧪 Testando a Aplicação

### Dados de Teste
1. Registre um usuário
2. Crie um quadro de exemplo
3. Adicione algumas tarefas com diferentes prioridades
4. Teste as funcionalidades de IA:
   - Crie uma tarefa com título "Tarefa urgente para o cliente"
   - Use a função "Melhorar com IA" na descrição
   - Veja as sugestões de prioridade e prazo

### Exemplos de Tarefas para Testar IA
- "Implementar login urgente para o sistema"
- "Revisar documentação do projeto"
- "Corrigir bug crítico na produção"
- "Planejar reunião semanal da equipe"

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com MongoDB**:
   - Verifique se o MongoDB está rodando
   - Confirme a string de conexão no `.env`

2. **Erro de autenticação OpenAI**:
   - Verifique se a API key está correta
   - Confirme se há créditos na conta OpenAI

3. **Erro CORS no frontend**:
   - Verifique se `FRONTEND_URL` está configurado no backend
   - Confirme se `REACT_APP_API_URL` aponta para o backend correto

4. **Dependências não encontradas**:
   ```bash
   # Reinstalar dependências
   cd backend && npm install
   cd ../frontend && npm install
   ```

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- Desenvolvido com ❤️ usando IA

## 🔮 Próximas Funcionalidades

- [ ] Notificações em tempo real
- [ ] Integração com calendário
- [ ] Relatórios em PDF
- [ ] Aplicativo mobile
- [ ] Integração com Slack/Discord
- [ ] Templates de quadros
- [ ] Automações baseadas em IA
- [ ] Análise de sentimentos das tarefas

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**Desenvolvido com React, Node.js e OpenAI** 🚀
