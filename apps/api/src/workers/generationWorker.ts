import { Worker } from 'bullmq';
import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/queue';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const validateGeneratedCode = async (generatedFiles: Record<string, string>): Promise<ValidationResult> => {
  try {
    const packageJson = generatedFiles['package.json'];
    const serverFile = generatedFiles['server.js'] || generatedFiles['index.js'];
    
    if (!packageJson) {
      return { valid: false, reason: 'package.json não encontrado' };
    }
    
    if (!serverFile) {
      return { valid: false, reason: 'Arquivo principal do servidor não encontrado' };
    }

    const systemPrompt = `Você é um agente de QA automatizado. Sua tarefa é realizar uma verificação de sanidade estática em um projeto Node.js. Analise os arquivos fornecidos e responda APENAS com um objeto JSON. Não adicione nenhum outro texto.`;

    const userPrompt = `Analise os seguintes arquivos:

PACKAGE.JSON:
${packageJson}

SERVIDOR PRINCIPAL:
${serverFile}

Verifique:
1. Existem erros de sintaxe óbvios?
2. As dependências importadas no servidor correspondem às listadas no package.json?
3. A estrutura básica do projeto está correta?

Responda com o seguinte formato JSON:
{"valid": boolean, "reason": "uma breve explicação se não for válido"}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return { valid: false, reason: 'Falha na validação: resposta vazia da IA' };
    }

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const validationResult = JSON.parse(jsonString) as ValidationResult;
      
      return validationResult;
    } catch (parseError) {
      console.error('Erro ao fazer parse da validação:', parseError);
      return { valid: false, reason: 'Erro interno na validação' };
    }
  } catch (error) {
    console.error('Erro durante validação:', error);
    return { valid: false, reason: 'Erro interno na validação' };
  }
};

const processProject = async (projectId: string) => {
  console.log(`[Worker] Iniciando geração para projeto: ${projectId}`);
  
  try {
    // Buscar o projeto completo do banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Projeto ${projectId} não encontrado`);
    }

    // Buscar ou criar o template react-express-base
    let template = await prisma.template.findUnique({
      where: { name: 'react-express-base' }
    });

    if (!template) {
      // Criar template básico se não existir
      console.log('[Worker] Criando template react-express-base básico');
      template = await prisma.template.create({
        data: {
          name: 'react-express-base',
          framework: 'react-express',
          language: 'typescript',
          files: {
            'package.json': `{
  "name": "generated-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "npm run build:client",
    "build:client": "cd client && npm run build"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}`,
            'server.js': `const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from client build
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
            'client/package.json': `{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.7.13",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.4.2",
    "web-vitals": "^2.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
            'client/src/App.tsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Your Generated App</h1>
        <p>This is a basic React + Express application.</p>
      </header>
    </div>
  );
}

export default App;`,
            'client/src/App.css': `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}`,
            'client/src/index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
            'client/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Generated application" />
    <title>Generated App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
            'README.md': `# Generated Application

This is a full-stack application generated by AI.

## Setup

1. Install server dependencies:
\`\`\`
npm install
\`\`\`

2. Install client dependencies:
\`\`\`
cd client && npm install
\`\`\`

## Development

1. Start the server:
\`\`\`
npm run dev
\`\`\`

2. In another terminal, start the client:
\`\`\`
cd client && npm start
\`\`\`

## Production

1. Build the client:
\`\`\`
npm run build
\`\`\`

2. Start the server:
\`\`\`
npm start
\`\`\``
          }
        }
      });
    }

    // Atualizar status para IN_PROGRESS
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'IN_PROGRESS' },
    });
    
    console.log(`[Worker] Gerando aplicação completa com IA para: "${project.prompt}"`);
    
    // Construir o prompt de sistema para chain-of-thought reasoning
    const systemPrompt = `Você é um engenheiro de software sênior especialista em desenvolvimento full-stack. Sua tarefa é modificar um projeto completo React + Express baseado na descrição do usuário.

CONTEXTO:
Você receberá um template base de uma aplicação full-stack e uma descrição do usuário de como ela deve ser modificada.

PROCESSO DE RACIOCÍNIO:
1. Analise a descrição do usuário para entender os requisitos
2. Examine a estrutura atual do projeto fornecida no template
3. Identifique quais arquivos precisam ser modificados ou criados
4. Considere as dependências e integrações entre frontend e backend
5. Mantenha a estrutura existente quando possível

REGRAS IMPORTANTES:
- Sua resposta DEVE ser um único objeto JSON válido contendo toda a estrutura de arquivos
- Mantenha todos os arquivos existentes, mesmo que não modificados
- Use as melhores práticas para React + TypeScript + Express
- Garanta que o código seja funcional e completo
- Mantenha consistência na nomenclatura e estrutura
- Adicione apenas as dependências necessárias no package.json

FORMATO DA RESPOSTA:
{
  "package.json": "conteúdo do arquivo...",
  "server.js": "conteúdo do arquivo...",
  "client/src/App.tsx": "conteúdo do arquivo...",
  ... (todos os outros arquivos)
}`;

    // Preparar o contexto do template para a IA
    const templateContext = `ESTRUTURA ATUAL DO PROJETO:

${JSON.stringify(template.files, null, 2)}

ARQUIVOS NO TEMPLATE:
${Object.keys(template.files as Record<string, unknown>).join('\n- ')}`;

    const userPrompt = `${templateContext}

DESCRIÇÃO DO USUÁRIO:
${project.prompt}

Com base na descrição do usuário acima, modifique os arquivos do template fornecido para implementar os recursos solicitados. Sua resposta deve ser um JSON válido contendo a estrutura completa de arquivos atualizada.`;

    // Chamar a API da OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('IA não retornou resposta válida');
    }
    
    // Parse da resposta da IA para garantir que é um JSON válido
    let generatedFiles;
    try {
      // Extrair JSON da resposta caso venha com texto adicional
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      generatedFiles = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError);
      throw new Error('IA não retornou JSON válido');
    }
    
    // Validar o código gerado antes de finalizar
    console.log(`[Worker] Validando código gerado para projeto: ${projectId}`);
    
    const validationResult = await validateGeneratedCode(generatedFiles);
    
    if (validationResult.valid) {
      // Salvar a estrutura de arquivos no banco de dados
      await prisma.project.update({
        where: { id: projectId },
        data: { 
          status: 'COMPLETED',
          generatedCode: generatedFiles
        },
      });
      
      console.log(`[Worker] Geração concluída para projeto: ${projectId}`);
      console.log(`[Worker] Arquivos gerados: ${Object.keys(generatedFiles).length}`);
    } else {
      // Marcar como falhado com a razão da validação
      await prisma.project.update({
        where: { id: projectId },
        data: { 
          status: 'FAILED',
          failureReason: validationResult.reason
        },
      });
      
      console.log(`[Worker] Validação falhou para projeto: ${projectId} - ${validationResult.reason}`);
      throw new Error(`Validação falhou: ${validationResult.reason}`);
    }
  } catch (error) {
    console.error(`[Worker] Erro na geração do projeto ${projectId}:`, error);
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Erro desconhecido'
      },
    });
    throw error;
  }
};

export const generationWorker = new Worker('generationQueue', async (job) => {
  console.log(`[Worker] Recebido job: ${job.name} com dados:`, job.data);
  
  // Support both new format (generateProject) and legacy format
  if (job.name === 'generateProject' || job.name === 'generate-code') {
    const { projectId } = job.data;
    await processProject(projectId);
  } else {
    console.error(`[Worker] Tipo de job desconhecido: ${job.name}`);
    throw new Error(`Tipo de job não suportado: ${job.name}`);
  }
}, { 
  connection: redisConnection,
});

console.log("Generation Worker is running...");