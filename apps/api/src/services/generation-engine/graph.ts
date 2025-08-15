import { END, StatefulGraph } from '@langchain/langgraph';
import { GenerationState } from './types';
import { generatorAgent } from './agents/generator.agent';
import { validatorAgent } from './agents/validator.agent';
import { githubAgent } from './agents/github.agent';

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

// Define o fluxo de trabalho como um grafo de estado
const workflow = new StatefulGraph<GenerationState>({
  channels: {
    // A 'channels' API permite que os nós modifiquem o estado de forma incremental.
    // Aqui estamos a mapear as chaves de GenerationState para que possam ser atualizadas.
    prompt: null,
    project_id: null,
    generation_id: null,
    template: null,
    generated_code: null,
    validation_results: null,
    repository_url: null,
    commit_hash: null,
    pull_request_url: null,
    agent_logs: {
      value: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    },
    error_message: null,
    messages: {
        value: (x, y) => x.concat(y),
        default: () => [],
    },
  },
});

// Adiciona os nós ao grafo, associando cada um a um agente
workflow.addNode('generator', generatorAgent);
workflow.addNode('validator', validatorAgent);
workflow.addNode('github', githubAgent);

// Define o ponto de entrada do grafo
workflow.setEntryPoint('generator');

// Adiciona as arestas (ligações) entre os nós
workflow.addEdge('generator', 'validator');
workflow.addConditionalEdges(
    'validator',
    decide_after_validation,
);
workflow.addEdge('github', END);

// Compila o grafo num objeto executável
export const generationGraph = workflow.compile();