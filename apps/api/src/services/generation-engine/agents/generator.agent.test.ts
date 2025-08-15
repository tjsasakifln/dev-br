import { GenerationState } from '../types';
import { generatorAgent } from './generator.agent';
import { AIMessageChunk } from '@langchain/core/messages';

// Mock the LLM to avoid actual API calls during tests
jest.mock('../utils/llm.config', () => ({
  openai: {
    invoke: jest.fn(),
  },
}));

// Import the mocked openai after mocking
import { openai } from '../utils/llm.config';

describe('Generator Agent', () => {
  it('should take a prompt and template, and return generated code', async () => {
    // 1. Arrange
    const initialState: GenerationState = {
      prompt: 'A simple task list app',
      project_id: 'proj_123',
      generation_id: 'gen_456',
      template: {
        id: 'react-fastapi',
        name: 'React + FastAPI',
        files: { 'README.md': '# Project Template' },
      },
      generated_code: {},
      agent_logs: [],
      messages: [],
    };

    const mockLlmResponse = new AIMessageChunk({
      content: JSON.stringify({
        'src/index.js': 'console.log("Hello, World!");',
        'package.json': '{ "name": "my-app" }',
      }),
    });

    (openai.invoke as jest.MockedFunction<typeof openai.invoke>).mockResolvedValue(mockLlmResponse);

    // 2. Act
    const resultState = await generatorAgent(initialState);

    // 3. Assert
    expect(openai.invoke).toHaveBeenCalled();
    expect(resultState.generated_code).toBeDefined();
    expect(resultState.generated_code!['src/index.js']).toBe(
      'console.log("Hello, World!");'
    );
    expect(resultState.generated_code!['package.json']).toBe(
      '{ "name": "my-app" }'
    );
    expect(resultState.agent_logs!.length).toBeGreaterThan(0);
    expect(resultState.agent_logs![0]).toContain('Generator Agent');
  });
});