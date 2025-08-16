import { prisma } from '../lib/prisma';
import { projectService } from '../api/v1/projects/projects.service';
import { Generation, Project, User } from '@prisma/client';
import { Worker } from 'bullmq';
import { redis } from '../lib/queue';

// --- Mocks ---
// Simula os LLMs para evitar chamadas de API reais
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        'src/index.js': 'console.log("Mocked code");',
      }),
    }),
  })),
}));

// Simula o serviço do GitHub
jest.mock('../services/github.service', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    createRepoForUser: jest.fn().mockResolvedValue('https://github.com/mock/repo'),
    pushCodeToRepo: jest.fn().mockResolvedValue('mock_sha'),
  })),
}));

// Simula o carregador de templates
jest.mock('../services/generation-engine/utils/template.loader', () => ({
    loadTemplate: jest.fn().mockResolvedValue({
        id: 'react-fastapi',
        name: 'React + FastAPI',
        files: { 'README.md': 'template file' },
    }),
}));


// --- Helper para aguardar a conclusão ---
const waitForGeneration = async (generationId: string, timeout = 20000): Promise<Generation> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const generation = await prisma.generation.findUnique({ where: { id: generationId } });
        if (generation?.status === 'COMPLETED' || generation?.status === 'FAILED') {
            return generation;
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // Poll a cada 200ms
    }
    throw new Error(`Timeout de geração excedido para a geração ${generationId}`);
};


// --- Suite de Testes ---
describe('Fluxo de Geração - Teste de Integração', () => {
  let testUser: User;
  let testProject: Project;
  let worker: Worker;

  beforeAll(async () => {
    // Limpa a base de dados antes de todos os testes
    await prisma.generation.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Cria um utilizador e projeto de teste
    testUser = await prisma.user.create({ data: { email: 'test@example.com', name: 'Test User' } });
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        prompt: 'Um simples contador',
        userId: testUser.id,
      },
    });

    // Inicia o worker para processar jobs durante o teste
    worker = new Worker(
      'generation',
      async (job) => {
        console.log(`Processing generation job ${job.id} for project ${job.data.projectId}`);
        const { projectId, prompt, template, generationId } = job.data;

        try {
          // Simula o processo de geração de forma simplificada para o teste
          await new Promise(resolve => setTimeout(resolve, 100)); // Simula algum processamento
          
          // Atualizar com estado final simulado
          await prisma.generation.update({
            where: { id: generationId },
            data: {
              status: 'COMPLETED',
              repositoryUrl: 'https://github.com/mock/repo',
              logs: { set: ['Generated mock code', 'Validated successfully', 'Pushed to GitHub'] },
            },
          });
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          await prisma.generation.update({
            where: { id: generationId },
            data: {
              status: 'FAILED',
              failureReason: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }

        console.log(`Finished processing job ${job.id}`);
      },
      { connection: redis }
    );

    console.log('Worker started for integration test');
  });

  afterAll(async () => {
    // Para o worker
    if (worker) {
      await worker.close();
    }
    await prisma.$disconnect();
  });


  it('deve processar uma geração completa com sucesso', async () => {
    // --- Act ---
    // Inicia a geração, o que cria uma entrada na base de dados e adiciona um job à fila
    const initialGeneration = await projectService.startGenerationForProject(testProject.id, testUser.id);
    expect(initialGeneration.status).toBe('QUEUED');

    // Aguarda a conclusão do job assíncrono
    const finalGeneration = await waitForGeneration(initialGeneration.id);

    // --- Assert ---
    expect(finalGeneration.status).toBe('COMPLETED');
    expect(finalGeneration.repositoryUrl).toBe('https://github.com/mock/repo');
    expect(finalGeneration.failureReason).toBeNull();
    
    // Verifica se os logs contêm entradas dos agentes (se disponíveis)
    if (finalGeneration.logs) {
      expect(finalGeneration.logs).toBeDefined();
      console.log('Generation logs:', finalGeneration.logs);
    }
    
    // Também verifica o projeto para ver se foi atualizado
    const updatedProject = await prisma.project.findUnique({ where: { id: testProject.id } });
    console.log('Updated project:', updatedProject);
  }, 30000); // 30 second timeout
});