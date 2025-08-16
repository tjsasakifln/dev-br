import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { prisma } from '../lib/prisma';
import { anthropic } from '../lib/anthropic';

class GenerationService {
  public async generateFileContent(
    prompt: string,
    filePath: string,
    originalContent: string
  ): Promise<string> {
    try {
      console.log(`[${filePath}] Calling Anthropic API...`);
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229', // Ou outro modelo de sua preferência
        max_tokens: 4096,
        system: 'You are an expert full-stack software developer. Your task is to rewrite a code file based on a user\'s requirement. Output ONLY the complete, raw, updated code for the file. Do not include any explanations, comments, or markdown formatting like ```typescript.',
        messages: [
          {
            role: 'user',
            content: `The user wants to build the following application: "${prompt}".

You are currently working on the file located at: "${filePath}".

Here is the original content of the template file:
\`\`\`
${originalContent}
\`\`\`

Please rewrite the entire file to best implement the user's requirement. Remember, your output must be only the raw code, without any extra text or formatting.`,
          },
        ],
      });

      const textBlock = response.content.find(block => block.type === 'text');
      const generatedCode = textBlock ? textBlock.text : '';
      console.log(`[${filePath}] Successfully received response from API.`);
      return generatedCode;
    } catch (error) {
      console.error(`Error calling Anthropic API for ${filePath}:`, error);
      throw new Error(`Failed to generate code for ${filePath}.`);
    }
  }
}

// Map para armazenar EventEmitters por ID de geração
const generationEventEmitters = new Map<string, EventEmitter>();

export const generationService = {
  getGenerationById: async (id: string) => {
    return await prisma.generation.findUnique({
      where: { id },
    });
  },

  getGenerationStatus: async (id: string) => {
    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        status: true,
        progress: true,
      },
    });
    return generation;
  },

  getGenerationLogs: async (id: string) => {
    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        logs: true,
      },
    });
    return generation;
  },

  getEventEmitter: (id: string): EventEmitter => {
    if (!generationEventEmitters.has(id)) {
      generationEventEmitters.set(id, new EventEmitter());
    }
    return generationEventEmitters.get(id)!;
  },

  run: async (projectId: string): Promise<void> => {
    // Buscar o projeto no banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Definir diretório de saída
    const outputDir = path.join('apps/api/uploads/generations', projectId);
    
    // Remover diretório existente e criar novamente para garantir geração limpa
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch (error) {
      // Ignorar erro se diretório não existir
    }
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`[${projectId}] Generation engine started. Analyzing prompt: "${project.prompt}"`);

    // Lógica de seleção de template baseada no prompt
    let selectedTemplatePath: string;
    const promptLower = project.prompt.toLowerCase();

    if (promptLower.includes('python') || promptLower.includes('fastapi')) {
      selectedTemplatePath = 'templates/react-fastapi';
    } else {
      selectedTemplatePath = 'templates/react-express';
    }

    console.log(`[${projectId}] Template selected based on prompt: ${selectedTemplatePath}`);

    // Ler os arquivos do template selecionado
    let fileList: string[];
    try {
      fileList = await fs.readdir(selectedTemplatePath);
      console.log(`[${projectId}] Files found in template: ${fileList.join(', ')}`);
    } catch (error) {
      console.warn(`[${projectId}] Could not read template directory: ${selectedTemplatePath}`);
      console.log(`[${projectId}] Files found in template: (directory not accessible)`);
      return;
    }

    // Instanciar o gerador para acessar métodos privados
    const generator = new GenerationService();

    console.log(`[${projectId}] Starting code generation loop...`);

    // Loop de geração de código
    for (const fileName of fileList) {
      const sourceFilePath = path.join(selectedTemplatePath, fileName);
      const destinationFilePath = path.join(outputDir, fileName);

      try {
        // Ler conteúdo do arquivo de origem
        const originalContent = await fs.readFile(sourceFilePath, 'utf-8');

        // Chamar simulador de IA
        const generatedContent = await generator.generateFileContent(
          project.prompt,
          fileName,
          originalContent
        );

        // Criar diretórios necessários e escrever arquivo de destino
        await fs.mkdir(path.dirname(destinationFilePath), { recursive: true });
        await fs.writeFile(destinationFilePath, generatedContent, 'utf-8');

        console.log(`[${projectId}] Successfully generated file: ${fileName}`);
      } catch (error) {
        console.error(`[${projectId}] Error generating file ${fileName}:`, error);
      }
    }

    console.log(`[${projectId}] Code generation loop completed. Output available at: ${outputDir}`);
  },
};