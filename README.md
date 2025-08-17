# Dev BR - AI-Powered Code Generation Platform
### Full-Stack Application Development with AI Assistance

<div align="center">
  <h3>Generate Complete Applications from Natural Language Descriptions</h3>
  <p><em>Proprietary AI-powered platform for full-stack application generation using React + FastAPI/Express</em></p>
  
  ![Proprietary License](https://img.shields.io/badge/license-Proprietary-red) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![React](https://img.shields.io/badge/React-19-blue) ![Commercial Software](https://img.shields.io/badge/status-commercial-green)
</div>

---

## 🏆 **Project Overview**

**Dev BR** is a proprietary AI-powered code generation platform that converts natural language requirements into functional full-stack applications. This commercial software platform generates React frontends with FastAPI or Express.js backends, including Docker configurations and deployment setup.

### **Current Features**

| Feature | Status | Description |
|---------|--------|-----------|
| **Full-Stack Generation** | ✅ Implemented | React frontend + FastAPI/Express backend |
| **Real-time Preview** | ✅ Implemented | WebContainers-based live preview |
| **GitHub Integration** | ✅ Implemented | Automatic repository creation and publishing |
| **Multi-Backend Support** | ✅ Implemented | Python FastAPI and Node.js Express templates |
| **Authentication** | ✅ Implemented | NextAuth.js with GitHub OAuth |
| **Project Management** | ✅ Implemented | Create, track, and manage generated projects |

## 🎯 **Use Cases**

### **Developers**
- **Rapid Prototyping** - Generate functional applications from text descriptions
- **Learning & Education** - Explore full-stack architectures and best practices
- **MVP Development** - Create working prototypes for validation
- **Template Generation** - Generate boilerplate code for common patterns

### **Development Teams**
- **Proof of Concepts** - Quickly test ideas and concepts
- **Client Demonstrations** - Create working demos for stakeholders
- **Architecture Exploration** - Test different technical approaches
- **Code Generation** - Automate repetitive development tasks

---

## 🏗️ **Technical Architecture**

### **1. AI-Powered Code Generation**
Our **LangGraph-based** generation system:
- **Requirements Analysis**: Processes natural language descriptions
- **Template Selection**: Chooses appropriate React + Backend templates
- **Code Generation**: Creates functional full-stack applications
- **Real-time Preview**: Provides immediate feedback via WebContainers

### **2. Multi-Agent Architecture**
Specialized agents handle different aspects:
- **Generator Agent**: Analyzes prompts and creates code structure
- **Validator Agent**: Checks syntax and validates generated code
- **GitHub Agent**: Handles repository creation and publishing

### **3. WebContainers Integration**
Real-time preview capabilities:
- **Browser-based Execution**: Run applications directly in the browser
- **Hot Reload**: Instant updates during code generation
- **Development Server**: Automatic npm install and dev server startup
- **Live Streaming**: Real-time code updates via Server-Sent Events

---

## 🚀 **Technology Stack**

### **Platform Infrastructure**
- **Frontend**: Next.js 15.2 + React 19 + TypeScript 5.7 + Tailwind CSS
- **Backend**: Node.js 20.x + Express.js + TypeScript
- **AI Engine**: LangGraph + OpenAI GPT-5 + Anthropic Claude Opus 4.1
- **Database**: PostgreSQL 15 with Prisma ORM
- **Cache/Queue**: Redis + BullMQ for async processing
- **Container Runtime**: WebContainers for browser-based execution
- **Authentication**: NextAuth.js with GitHub OAuth

### **Generated Application Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: FastAPI (Python) or Express.js (Node.js)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Deployment**: Docker + docker-compose configuration
- **Documentation**: Auto-generated README with setup instructions

---

## 🛠️ **Getting Started**

### **Prerequisites**
- Node.js 20.x or higher
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### **Development Setup**

```bash
# Clone the repository
git clone https://github.com/tjsasakifln/dev-br.git
cd dev-br

# Install dependencies
npm install

# Set up environment variables
cp apps/platform/.env.example apps/platform/.env.local
cp apps/api/.env.example apps/api/.env

# Start development environment
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start the development servers
npm run dev:platform  # Frontend on http://localhost:3000
npm run dev:api       # API on http://localhost:8000
```

### **Environment Variables**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Models
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# GitHub OAuth (for authentication)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📖 **Usage Guide**

### **1. Create a New Project**
1. Sign in with your GitHub account
2. Navigate to "New Project"
3. Provide a name and description for your application
4. Submit and wait for generation to complete

### **2. Monitor Generation Progress**
- View real-time logs during code generation
- Track progress through different AI agents
- Preview the application as it's being built

### **3. Preview and Test**
- Use the integrated WebContainer preview
- Test functionality directly in the browser
- Download the generated code as a zip file

### **4. Deploy to GitHub**
- Automatically create a new GitHub repository
- Push generated code with proper commit history
- Includes complete setup instructions

---

## 🔧 **API Reference**

### **Projects**
```bash
# Create project
POST /api/projects
{
  "name": "My App",
  "prompt": "Create a todo application with user authentication"
}

# List projects
GET /api/projects

# Get project details
GET /api/projects/:id

# Start code generation
POST /api/projects/:id/generate

# Get latest generation
GET /api/projects/:id/generations/latest
```

### **Generation Streaming**
```bash
# Real-time generation updates
GET /api/v1/generations/:id/stream
```

### **GitHub Integration**
```bash
# Publish to GitHub
POST /api/projects/:id/publish
{
  "accessToken": "github-access-token"
}
```

---

## 🧪 **Testing**

```bash
# Run all tests
npm run test

# Run API tests only
npm run test:api

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run cypress:run
```

---

## 📁 **Project Structure**

```
dev-br/
├── apps/
│   ├── platform/          # Next.js frontend application
│   │   ├── src/app/        # App Router pages
│   │   ├── src/components/ # React components
│   │   └── src/lib/        # Utilities and configurations
│   └── api/               # Express.js backend API
│       ├── src/routes/     # API endpoints
│       ├── src/services/   # Business logic
│       └── src/workers/    # Background job processors
├── templates/             # Code generation templates
│   ├── react-fastapi/     # React + FastAPI template
│   └── react-express/     # React + Express template
├── packages/
│   └── shared/            # Shared TypeScript types
└── docker-compose.yml     # Development environment
```

---

## 🤝 **Development & Licensing**

This is proprietary software owned by Confenge Avaliações e Inteligência Artificial LTDA. 

### **Commercial Licensing**
For commercial licensing, custom development, or integration opportunities, contact us at tiago@confenge.com.br.

### **Development Access**
Development access is restricted to authorized Confenge personnel and licensed partners only.

---

## 📄 **License**

This software is proprietary and confidential. All rights reserved by Confenge Avaliações e Inteligência Artificial LTDA. See the [LICENSE](https://github.com/tjsasakifln/dev-br/blob/main/LICENSE) file for complete terms and conditions.

**NOTICE**: This is commercial software. Unauthorized use, distribution, or modification is strictly prohibited.

---

## 🙏 **Acknowledgments**

- Built with LangGraph for AI agent orchestration
- Powered by [WebContainers](https://webcontainers.io/) for browser-based execution
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication via [NextAuth.js](https://next-auth.js.org/)

---

## 📞 **Support**

- 📚 [Documentation](https://github.com/tjsasakifln/dev-br/blob/main/README.md)
- 🐛 [Issue Tracker](https://github.com/tjsasakifln/dev-br/issues)
- 💬 [Discussions](https://github.com/tjsasakifln/dev-br/discussions)
- 📧 [Email Support](mailto:tiago@confenge.com.br)

**Tags**: #DevBR #AICodeGeneration #FullStack #React #TypeScript #LangGraph #WebContainers