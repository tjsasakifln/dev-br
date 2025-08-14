// Planner graph types
import { GraphState } from '../types';

export interface PlannerGraphState extends GraphState {
  plannerStep: 'analyze' | 'create_plan' | 'review' | 'finalize';
  currentPlan?: any;
  analysisResults?: any;
}