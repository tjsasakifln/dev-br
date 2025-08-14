// Open SWE core types
export interface GraphState {
  thread_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  messages: any[];
  metadata: Record<string, any>;
}

export interface TaskPlan {
  id: string;
  title: string;
  description: string;
  items: PlanItem[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  type: 'task' | 'subtask';
  dependencies: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
}

export interface TargetRepository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  defaultBranch: string;
}


export interface GraphConfigurationMetadata {
  [key: string]: any;
}