import { GenerationState } from '../types';
import { githubAgent } from './github.agent';
import * as githubService from '../../../services/github.service'; // Usamos o namespace para mock

// Mock todo o módulo de serviço do GitHub
jest.mock('../../../services/github.service');
const mockedGithubService = githubService as jest.Mocked<typeof githubService>;

describe('GitHub Agent', () => {
  it('should create a repository, push code, and return the repository URL', async () => {
    // Arrange
    const state: GenerationState = {
        prompt: 'A new app',
        project_id: 'proj_123',
        generation_id: 'gen_456',
        template: { id: '', name: '', files: {} },
        generated_code: {
            'index.js': 'console.log("pushed to github");',
        },
        agent_logs: [],
        messages: [],
        validation_results: { tests_passed: true }
    };

    const fakeRepoUrl = 'https://github.com/testuser/proj_123';
    mockedGithubService.createRepoForUser.mockResolvedValue(fakeRepoUrl);
    mockedGithubService.pushCodeToRepo.mockResolvedValue('main_branch_sha');

    // Act
    const result = await githubAgent(state);

    // Assert
    expect(mockedGithubService.createRepoForUser).toHaveBeenCalledWith('proj_123');
    expect(mockedGithubService.pushCodeToRepo).toHaveBeenCalledWith(
        expect.any(String), // username
        'proj_123',
        state.generated_code
    );
    expect(result.repository_url).toBe(fakeRepoUrl);
    expect(result.agent_logs).toBeDefined();
    expect(result.agent_logs!.some((log: string) => log.includes('Repository created successfully'))).toBe(true);
  });
});