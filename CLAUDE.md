# Visão Geral do Projeto

Este projeto é uma plataforma web de geração de aplicações full-stack orientada por IA. A plataforma permite aos usuários descrever uma aplicação em linguagem natural e gera automaticamente código completo (React + FastAPI/Express + Docker) pronto para execução. Compete diretamente com bolt.new oferecendo preview em tempo real, execução no navegador via WebContainers e criação automática de repositórios GitHub.

# Stack Tecnológico da Plataforma

* **Frontend**: Next.js 14+, React 18, TypeScript 5.3, Tailwind CSS, shadcn/ui
* **Backend**: Node.js 20.x, Express.js, TypeScript
* **Execução**: StackBlitz WebContainers para preview no navegador
* **Base de Dados**: PostgreSQL 15 com Prisma ORM para a plataforma
* **Cache/Sessions**: Redis para cache e gestão de sessões
* **Fila de Tarefas**: Bull Queue com Redis para processamento assíncrono
* **Motor de IA**: LangGraph + OpenAI GPT-5 + Anthropic Claude Opus 4.1
* **Autenticação**: NextAuth.js com Google OAuth e GitHub OAuth
* **Gestor de Pacotes**: `npm` com workspaces para monorepo
* **Containerização**: Docker e Docker Compose para desenvolvimento

# Aplicações Geradas (Output)

A plataforma gera aplicações com as seguintes tecnologias:
* **Frontend**: React 18 + TypeScript + Tailwind CSS
* **Backend**: FastAPI (Python) ou Express.js (Node.js)
* **Banco**: SQLite para desenvolvimento, PostgreSQL para produção
* **Deploy**: docker-compose.yml + Dockerfile + README.md completo

# Estrutura de Ficheiros

* `/apps/platform`: Aplicação Next.js da plataforma principal
    * `/apps/platform/src/app`: App Router do Next.js 14
    * `/apps/platform/src/components`: Componentes UI reutilizáveis (shadcn/ui)
    * `/apps/platform/src/lib`: Utilities, hooks e configurações
* `/apps/api`: Backend Express.js da plataforma
    * `/apps/api/src/routes`: Endpoints da API REST
    * `/apps/api/src/services`: Lógica de negócio e integração com IA
    * `/apps/api/src/workers`: Workers para geração assíncrona de código
* `/packages/shared`: Tipos TypeScript e utilities compartilhados
* `/templates`: Templates base para as aplicações geradas
    * `/templates/react-fastapi`: Template React + FastAPI
    * `/templates/react-express`: Template React + Express
* `docker-compose.yml`: Orquestra platform, api, postgres e redis

# Comandos Comuns

* **Iniciar todo o ambiente de desenvolvimento**: `docker-compose up`
* **Setup inicial**: `npm install` && `npm run setup` (instala deps e configura DBs)

## Platform (Next.js)
* **Desenvolvimento**: `npm run dev:platform`
* **Build**: `npm run build:platform`
* **Testes**: `npm run test:platform`
* **Lint**: `npm run lint:platform`

## API (Express)
* **Desenvolvimento**: `npm run dev:api`
* **Build**: `npm run build:api`
* **Testes**: `npm run test:api`
* **Migrações DB**: `npm run db:migrate`

## Workspace
* **Instalar deps em todas as apps**: `npm install`
* **Executar testes completos**: `npm run test`
* **Lint em todo o projeto**: `npm run lint`
* **Build completo**: `npm run build`

# Diretrizes de Estilo e Convenções

* **TypeScript**: Strict mode habilitado, ESLint + Prettier para formatação
* **React**: Functional components, hooks, server components quando possível
* **Next.js**: App Router, TypeScript, server actions para mutations
* **Express**: Controllers + Services + Repositories pattern
* **Nomes de ficheiros**: `kebab-case` (ex: `user-profile.tsx`, `code-generator.service.ts`)
* **Imports**: Importações absolutas com path mapping (`@/components`, `@/lib`)
* **Componentes**: PascalCase para componentes, camelCase para funções
* **APIs**: RESTful, status codes corretos, validação com Zod

# Estrutura de Dados

## Database Schema (Prisma)
* **User**: id, name, email, emailVerified, image, githubId, createdAt, subscriptionTier, accounts, sessions
* **Project**: id, userId, name, prompt, status, generatedCode, repositoryUrl, failureReason, userRating, userFeedback, uploadedFile, createdAt, updatedAt, generations
* **Generation**: id, projectId, status, progress, logs, aiModel, tokensUsed, generatedOutput, repositoryUrl, failureReason, createdAt, updatedAt
* **Template**: id, name, framework, language, files (JSON), createdAt, updatedAt
* **Account**: id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state (NextAuth.js)
* **Session**: id, sessionToken, userId, expires (NextAuth.js)
* **VerificationToken**: identifier, token, expires (NextAuth.js)

## API Endpoints
* `GET /api/projects` - Lista projetos do usuário
* `POST /api/projects` - Cria novo projeto
* `GET /api/projects/:id` - Detalhes do projeto
* `POST /api/projects/:id/generate` - Inicia geração de código (com rate limiting)
* `GET /api/projects/:id/generations/latest` - Última geração do projeto
* `POST /api/projects/:id/feedback` - Submete feedback do usuário
* `POST /api/projects/:id/publish` - Publica projeto no GitHub
* `GET /api/projects/:id/download` - Download do código gerado
* `POST /api/projects/:id/upload` - Upload de arquivo para o projeto
* `GET /api/generations/:id` - Detalhes completos da geração
* `GET /api/generations/:id/status` - Status da geração
* `GET /api/generations/:id/logs` - Logs em tempo real
* `GET /api/generations/:id/stream` - Stream SSE para updates em tempo real

# Integração com IA

## LangGraph Workflows
* **Generator Agent**: Analisa prompt → Seleciona template → Gera código
* **Validator Agent**: Verifica sintaxe → Testa execução → Valida segurança  
* **GitHub Agent**: Cria repositório → Commit inicial → Webhook setup

## WebContainers
* Preview em tempo real durante geração
* Execução de testes automáticos
* Hot reload para iterações
* Terminal integrado para debugging

# Arquitetura de Serviços

## Rate Limiting
* Implementado com express-rate-limit e Redis como store
* Limite de 5 requisições por hora na rota de geração (`POST /api/projects/:id/generate`)
* Chave baseada no ID do usuário autenticado, fallback para IP
* Retorna status 429 com mensagem de erro quando excedido

## Notificações por Email
* Serviço baseado em Nodemailer para envio de notificações automáticas
* Suporta notificações de sucesso e falha na geração de código
* Configuração para desenvolvimento com Ethereal Email (variáveis: ETHEREAL_HOST, ETHEREAL_PORT, ETHEREAL_USER, ETHEREAL_PASS)
* Templates HTML responsivos com branding da plataforma
* Preview de emails em desenvolvimento via Ethereal

# Etiqueta do Repositório (Git)

* **Nomes de ramos**: `feature/PLAT-123-chat-interface` ou `fix/API-456-auth-bug`
* **Mensagens de commit**: Conventional Commits (ex: `feat(platform): add real-time code preview`)
* **Fluxo de Trabalho**: Feature branches → PR review → Squash merge
* **CI/CD**: GitHub Actions com testes, lint, build e deploy automático
* **Pre-commit**: Husky + lint-staged para qualidade de código