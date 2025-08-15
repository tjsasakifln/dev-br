import { BaseMessage } from "@langchain/core/messages";

// Represents the full state of our generation graph.
// This object is passed between all nodes.
export interface GenerationState {
  // Input from the user
  prompt: string;
  project_id: string;
  generation_id: string;

  // Selected base template for generation
  template: {
    id: string;
    name: string;
    files: Record<string, string>; // filename -> content
  };

  // The current state of the generated code
  // Can be updated incrementally by agents
  generated_code: Record<string, string>;

  // For storing validation results, security issues, etc.
  validation_results?: {
    syntax_errors?: string[];
    security_vulnerabilities?: string[];
    lint_warnings?: string[];
    tests_passed: boolean;
  };

  // GitHub related information
  repository_url?: string;
  commit_hash?: string;
  pull_request_url?: string;

  // Log of actions taken by agents for debugging
  agent_logs: string[];

  // For handling failures
  error_message?: string;

  // Intermediate messages for conversation between agents
  messages: BaseMessage[];
}