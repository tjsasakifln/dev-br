# Sistema Open SWE - Arquitetura Completa Documentada

## 📋 Visão Geral
Este documento apresenta a estrutura completa do sistema Open SWE, uma plataforma de geração de aplicações full-stack orientada por IA que compete com bolt.new. O sistema utiliza LangGraph + IA para gerar código React + FastAPI/Express + Docker automaticamente.

## 🏗️ Estrutura Completa do Sistema

```
.
├── .claude/                              # 🔧 Configurações do Claude Code
│   └── settings.local.json               # Configurações locais da ferramenta
├── .github/workflows/                    # 🚀 CI/CD Pipelines
│   ├── ci.yml                           # Pipeline principal de integração contínua
│   ├── deploy-langgraph.yml             # Deploy específico do LangGraph
│   ├── pr_lint.yml                      # Linting automático em PRs
│   ├── sync-docs.yml                    # Sincronização de documentação
│   └── unit-tests.yml                   # Execução de testes unitários
├── .pytest_cache/                       # 🧪 Cache do pytest para testes Python
├── .turbo/                              # ⚡ Cache do Turborepo para builds
├── .vscode/                             # 💻 Configurações do VS Code
│   └── settings.json                    # Settings específicos do projeto

# ========== APLICAÇÕES PRINCIPAIS ==========
├── apps/
│   ├── api/                             # 🔗 Backend Express.js + TypeScript
│   │   ├── prisma/                      # 🗄️ Esquema de base de dados e migrações
│   │   │   ├── migrations/              # Migrações versionadas do Prisma
│   │   │   │   ├── 20250815130920_init_postgresql_with_nextauth/
│   │   │   │   ├── 20250815133409_add_template_model/
│   │   │   │   ├── 20250815140327_add_status_to_project/
│   │   │   │   ├── 20250815141605_add_generated_code_to_project/
│   │   │   │   ├── 20250815142518_change_generated_code_to_json/
│   │   │   │   ├── 20250815220413_add_feedback_and_failure_fields/
│   │   │   │   ├── 20250815232708_add_repository_and_failure_fields_to_generation/
│   │   │   │   ├── 20250816132309_add_uploaded_file_to_project/
│   │   │   │   ├── 20250816234359_add_user_credits/
│   │   │   │   └── migration_lock.toml
│   │   │   ├── dev.db                   # Base de dados SQLite para desenvolvimento
│   │   │   ├── schema.prisma            # Esquema principal da base de dados
│   │   │   └── seed.ts                  # Dados iniciais (seeds)
│   │   ├── src/
│   │   │   ├── __mocks__/               # 🎭 Mocks para testes unitários
│   │   │   │   └── @octokit/rest.ts     # Mock da API do GitHub
│   │   │   ├── config/                  # ⚙️ Configurações da aplicação
│   │   │   ├── controllers/             # 🎮 Controladores REST (Express)
│   │   │   │   ├── generation.controller.ts  # Controla geração de código
│   │   │   │   └── user.controller.ts        # Gestão de utilizadores
│   │   │   ├── integration/             # 🧪 Testes de integração completos
│   │   │   │   ├── generation-flow.integration.test.ts.bak
│   │   │   │   ├── generation.stack.test.ts  # Testa stack completo de geração
│   │   │   │   ├── projects.publish.test.ts  # Testa publicação no GitHub
│   │   │   │   ├── publish-real-app.test.ts  # Testa publicação real
│   │   │   │   ├── simple-publish.test.ts    # Testa publicação simples
│   │   │   │   └── users.me.test.ts          # Testa API de utilizador
│   │   │   ├── lib/                     # 📚 Bibliotecas e utilitários centrais
│   │   │   │   ├── anthropic.ts         # Cliente Anthropic Claude
│   │   │   │   ├── prisma.ts            # Cliente Prisma ORM
│   │   │   │   ├── queue.ts             # Configuração Bull Queue
│   │   │   │   └── redis.ts             # Cliente Redis
│   │   │   ├── middleware/              # 🔀 Middlewares Express.js
│   │   │   │   ├── asyncHandler.ts      # Wrapper para async/await
│   │   │   │   ├── auth.middleware.ts   # Autenticação JWT/Session
│   │   │   │   ├── errorHandler.ts      # Tratamento global de erros
│   │   │   │   ├── rateLimiter.ts       # Rate limiting com Redis
│   │   │   │   └── upload.ts            # Upload de ficheiros
│   │   │   ├── routes/                  # 🛤️ Definição de rotas REST
│   │   │   │   ├── v1/                  # API versão 1
│   │   │   │   │   ├── generations.routes.ts
│   │   │   │   │   └── users.routes.ts
│   │   │   │   ├── generations.routes.old.ts
│   │   │   │   ├── projects.routes.ts   # CRUD de projetos
│   │   │   │   └── users.routes.ts      # CRUD de utilizadores
│   │   │   ├── services/                # 🔧 Lógica de negócio central
│   │   │   │   ├── generation-engine/   # 🤖 Motor de IA LangGraph
│   │   │   │   │   ├── agents/          # Agentes especializados
│   │   │   │   │   │   ├── generator.agent.ts     # Gera código fonte
│   │   │   │   │   │   ├── github.agent.ts        # Integração GitHub
│   │   │   │   │   │   └── validator.agent.ts     # Valida código gerado
│   │   │   │   │   ├── schemas/         # Esquemas Zod para validação
│   │   │   │   │   │   ├── generation.schema.ts
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── template.schema.ts
│   │   │   │   │   ├── types/           # Tipos TypeScript dos agentes
│   │   │   │   │   │   ├── agents.ts
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── state.ts
│   │   │   │   │   ├── utils/           # Utilitários do motor IA
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── llm.config.ts        # Configuração LLMs
│   │   │   │   │   │   └── template.loader.ts   # Carregamento templates
│   │   │   │   │   ├── graph.ts         # 🕸️ Grafo principal LangGraph
│   │   │   │   │   └── index.ts         # Exportações públicas
│   │   │   │   ├── project/             # Pasta de serviços de projeto
│   │   │   │   ├── user/                # Pasta de serviços de utilizador
│   │   │   │   ├── email.service.ts     # 📧 Envio de emails (Nodemailer)
│   │   │   │   ├── generation.service.ts # Orquestra geração de código
│   │   │   │   ├── github.service.ts    # Integração completa GitHub API
│   │   │   │   ├── project.service.ts   # CRUD projetos + lógica
│   │   │   │   └── user.service.ts      # CRUD utilizadores + auth
│   │   │   ├── workers/                 # ⚙️ Workers assíncronos (Bull Queue)
│   │   │   │   ├── generationWorker.ts  # Worker principal de geração
│   │   │   │   └── graph.worker.ts      # Worker do LangGraph
│   │   │   ├── index.ts                 # 🚀 Entry point da aplicação
│   │   │   └── test-setup.ts            # Configuração base para testes
│   │   ├── uploads/                     # 📁 Pasta para uploads temporários
│   │   ├── .env                         # Variáveis de ambiente (não versionado)
│   │   ├── .env.example                 # Template de variáveis
│   │   ├── Dockerfile                   # Container Docker da API
│   │   ├── jest.config.js               # Configuração Jest para testes
│   │   ├── package.json                 # Dependências e scripts npm
│   │   └── tsconfig.json                # Configuração TypeScript
│   └── platform/                        # 🌐 Frontend Next.js 14
│       ├── cypress/                     # 🧪 Testes E2E com Cypress
│       │   ├── e2e/                     # Testes end-to-end
│       │   │   ├── auth.cy.ts           # Testa autenticação
│       │   │   ├── create-project.cy.ts # Testa criação de projeto
│       │   │   ├── dashboard.cy.ts      # Testa dashboard
│       │   │   ├── login.cy.ts          # Testa página de login
│       │   │   └── project-progress.cy.ts # Testa progresso
│       │   ├── fixtures/                # Dados de teste fixos
│       │   ├── screenshots/             # Screenshots dos testes
│       │   └── support/                 # Comandos personalizados Cypress
│       ├── public/                      # 🎨 Assets estáticos
│       │   ├── jaguar-pattern.svg       # Padrão visual Brasil
│       │   └── logo.svg                 # Logo da plataforma
│       ├── src/
│       │   ├── app/                     # 📱 App Router Next.js 14
│       │   │   ├── api/                 # 🔗 API Routes Next.js
│       │   │   │   ├── [..._path]/      # Proxy dinâmico para API
│       │   │   │   ├── auth/            # Autenticação NextAuth.js
│       │   │   │   │   ├── [...nextauth]/
│       │   │   │   │   ├── github/      # OAuth GitHub
│       │   │   │   │   ├── logout/
│       │   │   │   │   ├── status/
│       │   │   │   │   └── user/
│       │   │   │   └── github/          # Integração GitHub App
│       │   │   │       ├── installation/
│       │   │   │       ├── installation-callback/
│       │   │   │       ├── installations/
│       │   │   │       ├── proxy/
│       │   │   │       ├── repositories/
│       │   │   │       ├── switch-installation/
│       │   │   │       └── token/
│       │   │   ├── create/              # 📝 Página criação projeto
│       │   │   ├── dashboard/           # 📊 Dashboard principal
│       │   │   │   ├── projects/        # Gestão de projetos
│       │   │   │   │   ├── [id]/        # Detalhes projeto específico
│       │   │   │   │   └── new/         # Novo projeto
│       │   │   │   ├── layout.tsx       # Layout do dashboard
│       │   │   │   └── page.tsx         # Página principal dashboard
│       │   │   ├── login/               # 🔐 Página de autenticação
│       │   │   ├── project/             # Visualização projetos
│       │   │   ├── projects/            # Listagem projetos
│       │   │   ├── users/               # Gestão utilizadores
│       │   │   ├── globals.css          # 🎨 Estilos globais CSS
│       │   │   ├── layout.tsx           # Layout raiz da aplicação
│       │   │   └── page.tsx             # Homepage
│       │   ├── components/              # 🧱 Componentes React reutilizáveis
│       │   │   ├── auth/                # Componentes autenticação
│       │   │   ├── configuration/       # Componentes configuração
│       │   │   ├── create/              # Componentes criação projeto
│       │   │   ├── dashboard/           # Componentes dashboard
│       │   │   ├── demo/                # Componentes demonstração
│       │   │   ├── gen-ui/              # UI para geração de código
│       │   │   ├── github/              # Componentes GitHub
│       │   │   ├── icons/               # Ícones SVG customizados
│       │   │   ├── layout/              # Componentes layout
│       │   │   ├── plan/                # Visualização planos IA
│       │   │   ├── project/             # Componentes projeto
│       │   │   ├── projects/            # Lista e gestão projetos
│       │   │   ├── providers/           # Context providers React
│       │   │   ├── sidebar-buttons/     # Botões barra lateral
│       │   │   ├── tasks/               # Componentes tarefas
│       │   │   ├── thread/              # Componentes thread/chat
│       │   │   ├── ui/                  # 🎨 Componentes UI base (shadcn/ui)
│       │   │   └── v2/                  # Componentes versão 2
│       │   ├── features/                # 🎯 Features específicas
│       │   │   └── settings-page/       # Página de configurações
│       │   ├── hooks/                   # 🎣 Custom React hooks
│       │   │   ├── use-performance.ts   # Hook performance
│       │   │   ├── use-project-status.tsx # Status projetos
│       │   │   ├── useAuth.ts           # Hook autenticação
│       │   │   ├── useCreateProject.ts  # Criação projetos
│       │   │   ├── useGitHubApp.ts      # Integração GitHub App
│       │   │   └── [outros hooks...]
│       │   ├── lib/                     # 📚 Bibliotecas e utilitários
│       │   │   ├── hooks/               # Hooks de biblioteca
│       │   │   ├── schemas/             # Esquemas validação
│       │   │   ├── api.ts               # Cliente API
│       │   │   ├── auth.ts              # Configuração NextAuth
│       │   │   └── utils.ts             # Utilitários gerais
│       │   ├── providers/               # 🔄 Context Providers globais
│       │   ├── services/                # 🔧 Serviços frontend
│       │   ├── stores/                  # 🗄️ Stores de estado (Zustand)
│       │   ├── types/                   # 📝 Tipos TypeScript
│       │   ├── utils/                   # 🛠️ Utilitários específicos
│       │   └── middleware.ts            # Middleware Next.js
│       ├── .env.local                   # Variáveis ambiente locais
│       ├── Dockerfile                   # Container Docker do frontend
│       ├── next.config.mjs              # Configuração Next.js
│       ├── package.json                 # Dependências npm
│       ├── tailwind.config.js           # Configuração Tailwind CSS
│       └── tsconfig.json                # Configuração TypeScript

# ========== PACOTES COMPARTILHADOS ==========
├── packages/
│   └── shared/                          # 📦 Código compartilhado entre apps
│       ├── src/
│       │   ├── github/                  # Utilitários GitHub
│       │   │   ├── allowed-users.ts     # Lista utilizadores permitidos
│       │   │   ├── auth.ts              # Autenticação GitHub
│       │   │   └── verify-user.ts       # Verificação utilizadores
│       │   ├── open-swe/                # Tipos específicos Open SWE
│       │   │   ├── manager/types.ts     # Tipos do manager
│       │   │   ├── planner/types.ts     # Tipos do planner
│       │   │   ├── reviewer/types.ts    # Tipos do reviewer
│       │   │   ├── custom-node-events.ts
│       │   │   ├── tasks.ts             # Definições de tarefas
│       │   │   ├── tools.ts             # Ferramentas disponíveis
│       │   │   └── types.ts             # Tipos gerais
│       │   ├── caching.ts               # Sistema cache
│       │   ├── constants.ts             # Constantes globais
│       │   ├── crypto.ts                # Utilitários criptografia
│       │   ├── index.ts                 # Exportações principais
│       │   └── messages.ts              # Tipos de mensagens
│       ├── package.json
│       └── tsconfig.json

# ========== TEMPLATES DE APLICAÇÕES ==========
├── templates/                           # 🏗️ Templates para aplicações geradas
│   ├── react-express/                  # Template React + Express.js
│   │   ├── backend/                     # Backend Express + TypeScript
│   │   │   ├── src/
│   │   │   │   ├── controllers/         # Controladores exemplo
│   │   │   │   ├── routes/              # Rotas exemplo
│   │   │   │   ├── services/            # Serviços exemplo
│   │   │   │   └── index.ts             # Entry point
│   │   │   ├── Dockerfile               # Container backend
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   ├── frontend/                    # Frontend React + Vite
│   │   │   ├── src/
│   │   │   │   ├── components/          # Componentes exemplo
│   │   │   │   ├── types/               # Tipos exemplo
│   │   │   │   ├── App.tsx
│   │   │   │   └── main.tsx
│   │   │   ├── Dockerfile               # Container frontend
│   │   │   ├── package.json
│   │   │   ├── tailwind.config.js
│   │   │   └── vite.config.ts
│   │   ├── README.md                    # Documentação template
│   │   └── docker-compose.yml           # Orquestração completa
│   └── react-fastapi/                  # Template React + FastAPI
│       ├── backend/                     # Backend Python + FastAPI
│       │   ├── app/
│       │   │   ├── api/                 # Rotas API
│       │   │   ├── main.py              # Entry point FastAPI
│       │   │   └── models.py            # Modelos Pydantic
│       │   ├── Dockerfile
│       │   └── requirements.txt         # Dependências Python
│       ├── frontend/                    # Frontend React + Vite
│       │   ├── src/
│       │   │   ├── components/
│       │   │   ├── services/            # Cliente API
│       │   │   ├── types/
│       │   │   └── App.tsx
│       │   ├── Dockerfile
│       │   ├── package.json
│       │   └── vite.config.ts
│       ├── README.md
│       └── docker-compose.yml

# ========== CONFIGURAÇÕES RAIZ ==========
├── .gitignore                           # Ficheiros ignorados Git
├── AGENTS.md                            # 🤖 Documentação agentes IA
├── CLAUDE.md                            # 📋 Instruções Claude Code
├── PRD.md                               # 📋 Product Requirements Document
├── README.md                            # 📖 Documentação principal
├── SECURITY.md                          # 🔒 Políticas segurança
├── docker-compose.yml                   # 🐳 Orquestração desenvolvimento
├── package.json                         # 📦 Scripts e deps workspace
├── tsconfig.json                        # ⚙️ Config TypeScript raiz
└── turbo.json                           # ⚡ Configuração Turborepo
```

## 🔧 Tecnologias e Arquitetura

### Stack Principal
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js + TypeScript
- **Base de Dados**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis para sessões e rate limiting
- **Queue**: Bull Queue para processamento assíncrono
- **IA**: LangGraph + OpenAI GPT + Anthropic Claude
- **Auth**: NextAuth.js (Google + GitHub OAuth)
- **Deploy**: Docker + Docker Compose

### Arquitetura de Microserviços
1. **apps/platform**: Interface web principal (Next.js)
2. **apps/api**: Backend REST API (Express.js)
3. **packages/shared**: Código compartilhado entre serviços
4. **templates/**: Templates base para aplicações geradas

### Fluxo de Geração de Código
1. **Input**: Utilizador descreve aplicação em linguagem natural
2. **LangGraph**: Motor IA analisa prompt e seleciona template
3. **Agents**: 
   - **Generator**: Gera código fonte completo
   - **Validator**: Valida sintaxe e testa execução
   - **GitHub**: Cria repositório e faz deploy
4. **Output**: Aplicação completa (React + Backend + Docker)

### Integração GitHub
- **GitHub App**: Integração completa com permissões específicas
- **OAuth**: Autenticação via GitHub
- **Auto-deploy**: Criação automática de repositórios
- **Webhooks**: Notificações em tempo real

### Sistema de Queues
- **Bull Queue**: Processamento assíncrono de gerações
- **Redis**: Backend para queues e cache
- **Workers**: Processamento em background
- **Real-time**: Updates via WebSockets/SSE

### Base de Dados (Prisma Schema)
- **User**: Utilizadores da plataforma
- **Project**: Projetos criados pelos utilizadores
- **Generation**: Histórico de gerações de código
- **Template**: Templates disponíveis
- **Account/Session**: Tabelas NextAuth.js

### Sistema de Rate Limiting
- **Express-rate-limit**: Controlo de requests
- **Redis Store**: Persistência de contadores
- **Por Utilizador**: 5 gerações/hora
- **Graceful**: Mensagens de erro amigáveis

### Testes
- **Unit**: Jest para backend + React Testing Library
- **Integration**: Testes completos de fluxo
- **E2E**: Cypress para interface
- **Mocks**: @octokit/rest e outros serviços externos

### CI/CD Pipeline
- **GitHub Actions**: Automação completa
- **Testes**: Execução automática em PRs
- **Lint**: Verificação código
- **Deploy**: Deploy automático LangGraph
- **Docs**: Sincronização documentação

## 🚀 Comandos Principais

### Desenvolvimento
```bash
# Ambiente completo
docker-compose up

# Desenvolvimento individual
npm run dev:platform  # Frontend Next.js
npm run dev:api       # Backend Express.js

# Base de dados
npm run db:migrate    # Executar migrações
npm run db:seed      # Dados iniciais
```

### Testes
```bash
npm test              # Todos os testes
npm run test:platform # Testes frontend
npm run test:api     # Testes backend
npx cypress run      # Testes E2E
```

### Build e Deploy
```bash
npm run build        # Build completo
npm run lint         # Verificação código
docker-compose up --build  # Rebuild containers
```

## 🎯 Funcionalidades Principais

1. **Geração IA**: Prompt → Código completo automaticamente
2. **Preview Real-time**: WebContainers para execução no navegador  
3. **GitHub Integration**: Criação automática de repositórios
4. **Multi-template**: React+Express.js ou React+FastAPI
5. **Rate Limiting**: Controlo de uso por utilizador
6. **Email Notifications**: Notificações de sucesso/falha
7. **File Upload**: Upload de ficheiros para contexto
8. **Real-time Updates**: Progresso em tempo real via SSE
9. **Feedback System**: Classificações e comentários
10. **Credit System**: Sistema de créditos por utilizador

## 🔒 Segurança

- **OAuth 2.0**: Autenticação Google + GitHub
- **JWT**: Tokens seguros para API
- **Rate Limiting**: Proteção contra spam
- **Input Validation**: Zod schemas em todas as APIs
- **CORS**: Configuração apropriada
- **Environment Variables**: Secrets em .env
- **Docker**: Containerização para isolamento

Este sistema representa uma plataforma completa e robusta para geração automática de aplicações full-stack, competindo diretamente com soluções como bolt.new mas com foco no mercado brasileiro e integração GitHub nativa.