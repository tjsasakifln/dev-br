import { GenerationState } from '../types';
import { createRepoForUser, pushCodeToRepo } from '../../../services/github.service';

/**
 * O GitHub Agent é responsável por publicar o código gerado num repositório GitHub.
 * @param state O estado atual da geração.
 * @returns Uma atualização parcial do estado com o URL do repositório.
 */
export const githubAgent = async (
  state: GenerationState
): Promise<Partial<GenerationState>> => {
  const newLogs = [
    ...state.agent_logs,
    'GitHub Agent: Iniciando publicação no repositório.',
  ];
  console.log(newLogs[newLogs.length - 1]);

  // Passo de segurança: não fazer push se a validação falhou.
  if (!state.validation_results?.tests_passed) {
    const message = 'GitHub Agent: Publicação ignorada porque a validação do código falhou.';
    console.log(message);
    return {
      agent_logs: [...newLogs, message],
    };
  }

  try {
    // NOTA: O username virá do estado da sessão do utilizador na implementação real.
    const username = 'mockuser';
    const repoName = state.project_id;

    const repoUrl = await createRepoForUser(repoName);
    console.log(`GitHub Agent: Repositório criado em ${repoUrl}`);

    await pushCodeToRepo(username, repoName, state.generated_code);
    console.log('GitHub Agent: Código enviado para o repositório.');

    return {
      repository_url: repoUrl,
      agent_logs: [
        ...newLogs,
        `GitHub Agent: Repository created successfully at ${repoUrl}`,
      ],
    };
  } catch (error) {
    const message = `GitHub Agent: Erro ao publicar no GitHub: ${(error as Error).message}`;
    console.error(message);
    return {
      agent_logs: [...newLogs, message],
      error_message: (error as Error).message,
    };
  }
};