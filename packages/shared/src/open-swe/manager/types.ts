// Manager graph types
import { GraphState } from '../types';

export interface ManagerGraphState extends GraphState {
  managerStep: 'initialize' | 'plan' | 'execute' | 'review' | 'complete';
  currentPlan?: string;
  activeTasks: string[];
}

export interface ManagerGraphUpdate {
  type: 'manager_update';
  step: string;
  data: any;
}