// Task management utilities
import { PlanItem, TaskPlan, Task } from './types';

export function getActivePlanItems(plan: TaskPlan): PlanItem[] {
  return plan.items.filter(item => item.status === 'in_progress' || item.status === 'pending');
}

export function getCompletedPlanItems(plan: TaskPlan): PlanItem[] {
  return plan.items.filter(item => item.status === 'completed');
}

export function calculatePlanProgress(plan: TaskPlan): number {
  if (plan.items.length === 0) return 0;
  const completed = getCompletedPlanItems(plan).length;
  return (completed / plan.items.length) * 100;
}

export function getTaskProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return totalProgress / tasks.length;
}

export function getActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'in_progress' || task.status === 'pending');
}

export function getCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'completed');
}