import { GenerationState } from '../types';
import { validatorAgent } from './validator.agent';

describe('Validator Agent', () => {
  it('should return validation success for valid code', async () => {
    // Arrange
    const state: GenerationState = {
      // ... (simplified state for this test)
      prompt: '', project_id: '', generation_id: '', template: {id: '', name: '', files: {}},
      generated_code: {
        'package.json': '{ "name": "my-app", "version": "1.0.0" }',
        'src/index.js': 'console.log("hello");',
      },
      agent_logs: [],
      messages: [],
    };

    // Act
    const result = await validatorAgent(state);

    // Assert
    expect(result.validation_results).toBeDefined();
    expect(result.validation_results?.tests_passed).toBe(true);
    expect(result.validation_results?.syntax_errors).toBeUndefined();
    expect(result.agent_logs).toBeDefined();
    expect(result.agent_logs!.some(log => log.includes('Validation successful'))).toBe(true);
  });

  it('should return validation failure for invalid code (malformed JSON)', async () => {
    // Arrange
    const state: GenerationState = {
      // ... (simplified state for this test)
      prompt: '', project_id: '', generation_id: '', template: {id: '', name: '', files: {}},
      generated_code: {
        'package.json': '{ "name": "my-app", "version": "1.0.0", }', // Extra comma
      },
      agent_logs: [],
      messages: [],
    };

    // Act
    const result = await validatorAgent(state);

    // Assert
    expect(result.validation_results).toBeDefined();
    expect(result.validation_results?.tests_passed).toBe(false);
    expect(result.validation_results?.syntax_errors).toBeDefined();
    expect(result.validation_results?.syntax_errors?.length).toBeGreaterThan(0);
    expect(result.validation_results?.syntax_errors?.[0]).toContain('package.json');
    expect(result.agent_logs).toBeDefined();
    expect(result.agent_logs!.some(log => log.includes('Validation failed'))).toBe(true);
  });
});