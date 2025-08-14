// Reviewer graph types
import { GraphState } from '../types';

export interface ReviewerGraphState extends GraphState {
  reviewerStep: 'analyze_changes' | 'run_tests' | 'create_review' | 'finalize';
  changedFiles: string[];
  testResults?: any;
  reviewComments?: any[];
}