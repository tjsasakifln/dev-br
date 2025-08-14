// Tool definitions and utilities for Open SWE
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  id: string;
  success: boolean;
  output: any;
  error?: string;
}

export const AVAILABLE_TOOLS = {
  FILE_READ: 'file_read',
  FILE_WRITE: 'file_write',
  FILE_EDIT: 'file_edit',
  BASH_COMMAND: 'bash_command',
  GIT_COMMAND: 'git_command',
  SEARCH_FILES: 'search_files',
  GREP_FILES: 'grep_files',
} as const;

export type ToolName = typeof AVAILABLE_TOOLS[keyof typeof AVAILABLE_TOOLS];