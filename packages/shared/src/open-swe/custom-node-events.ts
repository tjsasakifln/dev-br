// Custom node events for Open SWE workflows
export interface CustomNodeEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface Step {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description?: string;
}

export const CUSTOM_NODE_EVENTS = {
  STEP_STARTED: 'step_started',
  STEP_COMPLETED: 'step_completed',
  STEP_FAILED: 'step_failed',
  PLAN_APPROVED: 'plan_approved',
  PLAN_REJECTED: 'plan_rejected',
  HUMAN_HELP_REQUESTED: 'human_help_requested',
} as const;

export type CustomNodeEventType = typeof CUSTOM_NODE_EVENTS[keyof typeof CUSTOM_NODE_EVENTS];