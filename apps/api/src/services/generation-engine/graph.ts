import { END, StateGraph } from '@langchain/langgraph';
import { GenerationState } from './types';
import { generatorAgent } from './agents/generator.agent';
import { validatorAgent } from './agents/validator.agent';
import { githubAgent } from './agents/github.agent';
import { prisma } from '../../lib/prisma';

/**
 * Decide o próximo passo após a validação do código.
 * Se a validação passou, prossegue para o nó do GitHub.
 * Se falhou, termina o fluxo de trabalho.
 * @param state O estado atual da geração.
 * @returns A string que representa o próximo nó ('github' ou END).
 */
const decide_after_validation = (state: GenerationState): 'github' | typeof END => {
  if (state.validation_results?.tests_passed) {
    return 'github';
  }
  return END;
};

// Define os canais do nosso estado
const graphState = {
    prompt: { value: null },
    project_id: { value: null },
    generation_id: { value: null },
    template: { value: null },
    generated_code: { value: null },
    validation_results: { value: null },
    repository_url: { value: null },
    commit_hash: { value: null },
    pull_request_url: { value: null },
    agent_logs: {
      value: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    },
    error_message: { value: null },
    messages: {
        value: (x: any, y: any) => x.concat(y),
        default: () => [],
    },
};

// Corrija a instanciação do StateGraph
const workflow = new StateGraph({
    channels: graphState,
} as any);

// Adicione os nós ao workflow
(workflow as any).addNode('generator', generatorAgent);
(workflow as any).addNode('validator', validatorAgent);
(workflow as any).addNode('github', githubAgent);

// Defina o ponto de entrada e as arestas
(workflow as any).setEntryPoint('generator');
(workflow as any).addEdge('generator', 'validator');

(workflow as any).addConditionalEdges(
  'validator',
  (state: any) => {
    if (state.validation_results?.tests_passed) {
      return 'github';
    }
    return END;
  },
  {
    github: 'github',
  }
);
(workflow as any).addEdge('github', END);

// Compila o grafo num objeto executável
export const generationGraph = workflow.compile();

/**
 * Invoca o grafo de geração de código com streaming de eventos em tempo real.
 * @param projectId ID do projeto para gerar código
 * @param prompt Prompt do usuário para geração
 * @returns Resultado da geração com status e output path
 */
export async function invokeGenerationGraph(
  projectId: string, 
  prompt: string
): Promise<{ status: 'success' | 'failed'; outputPath?: string; error?: string }> {
  let generationId: string | null = null;
  
  try {
    // Criar registro de geração no banco
    const generation = await prisma.generation.create({
      data: {
        projectId,
        status: 'running',
        progress: 0,
        logs: { events: [] },
        aiModel: 'gpt-4'
      }
    });
    
    generationId = generation.id;
    console.log(`🚀 Iniciando geração ${generationId} para projeto ${projectId}`);

    // Criar estado inicial do grafo
    const initialState: GenerationState = {
      prompt,
      project_id: projectId,
      generation_id: generationId,
      template: {
        id: 'react-fastapi',
        name: 'React + FastAPI',
        files: {}
      },
      generated_code: {},
      agent_logs: [],
      messages: []
    };

    // Criar stream de eventos do grafo
    const stream = generationGraph.stream(initialState as any);
    let currentProgress = 0;
    let finalState: GenerationState | null = null;

    // Iterar sobre os eventos do stream
    for await (const event of stream as any) {
      console.log(`📊 Evento do grafo:`, event);
      
      // Extrair informações do evento
      const nodeNames = Object.keys(event);
      const currentNode = nodeNames[0];
      const nodeState = event[currentNode] as GenerationState;
      
      // Atualizar progresso baseado no nó atual
      if (currentNode === 'generator') {
        currentProgress = 30;
      } else if (currentNode === 'validator') {
        currentProgress = 70;
      } else if (currentNode === 'github') {
        currentProgress = 90;
      }

      // Preparar logs do evento
      const eventLog = {
        timestamp: new Date().toISOString(),
        node: currentNode,
        message: `Processando nó: ${currentNode}`,
        details: {
          agent_logs: nodeState.agent_logs || [],
          error_message: nodeState.error_message
        }
      };

      // Atualizar logs e progresso no banco de dados
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          progress: currentProgress,
          logs: {
            events: [...(generation.logs as any)?.events || [], eventLog]
          },
          status: nodeState.error_message ? 'failed' : 'running'
        }
      });

      // Armazenar estado final
      finalState = nodeState;

      console.log(`📈 Progresso atualizado: ${currentProgress}% no nó ${currentNode}`);
    }

    // Verificar resultado final
    if (!finalState) {
      throw new Error('Stream terminou sem estado final');
    }

    if (finalState.error_message) {
      // Atualizar como falha
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'failed',
          progress: 100,
          failureReason: finalState.error_message
        }
      });

      console.log(`❌ Geração ${generationId} falhou: ${finalState.error_message}`);
      return { 
        status: 'failed', 
        error: finalState.error_message 
      };
    }

    // Sucesso - atualizar com código gerado
    const outputPath = finalState.repository_url || 'local_generation';
    
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'completed',
        progress: 100,
        generatedOutput: JSON.stringify(finalState.generated_code),
        repositoryUrl: finalState.repository_url
      }
    });

    console.log(`✅ Geração ${generationId} concluída com sucesso`);
    console.log(`📁 Output path: ${outputPath}`);

    return { 
      status: 'success', 
      outputPath 
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`💥 Erro na geração ${generationId}:`, error);

    // Atualizar como falha se temos um generationId
    if (generationId) {
      try {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'failed',
            progress: 100,
            failureReason: errorMessage
          }
        });
      } catch (dbError) {
        console.error(`💥 Erro ao atualizar falha no banco:`, dbError);
      }
    }

    return { 
      status: 'failed', 
      error: errorMessage 
    };
  }
}