import { GenerationState } from '../types';

/**
 * O Validator Agent analisa o código gerado em busca de erros.
 * Nesta versão inicial, focamo-nos na validação da sintaxe de ficheiros JSON.
 * @param state O estado atual da geração, contendo o código a ser validado.
 * @returns Uma atualização parcial do estado com os resultados da validação.
 */
export const validatorAgent = async (
  state: GenerationState
): Promise<Partial<GenerationState>> => {
  const newLogs = [
    ...state.agent_logs,
    'Validator Agent: Iniciando validação do código gerado.',
  ];
  console.log(newLogs[newLogs.length - 1]);

  const syntaxErrors: string[] = [];

  for (const [filePath, content] of Object.entries(state.generated_code)) {
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (error) {
        const errorMessage = `Erro de sintaxe JSON em '${filePath}': ${(error as Error).message}`;
        syntaxErrors.push(errorMessage);
      }
    }
  }

  if (syntaxErrors.length > 0) {
    console.log('Validator Agent: Erros de validação encontrados.');
    return {
      agent_logs: [...newLogs, 'Validator Agent: Validation failed.'],
      validation_results: {
        tests_passed: false,
        syntax_errors: syntaxErrors,
      },
    };
  }

  console.log('Validator Agent: Código validado com sucesso.');
  return {
    agent_logs: [...newLogs, 'Validator Agent: Validation successful.'],
    validation_results: {
      tests_passed: true,
    },
  };
};