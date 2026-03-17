import type { Plan, PlanStep, PlannerInput, ToolResult } from '../types.js';

let currentPlan: Plan | null = null;

export function createPlan(input: PlannerInput): ToolResult {
  const steps: PlanStep[] = input.steps.map((desc, idx) => ({
    id: idx + 1,
    description: desc,
    status: 'pending',
  }));

  currentPlan = {
    goal: input.goal,
    steps,
    createdAt: new Date(),
  };

  const output = formatPlan(currentPlan);
  return { success: true, output };
}

export function updatePlanStep(stepId: number, status: PlanStep['status']): ToolResult {
  if (!currentPlan) {
    return { success: false, output: '', error: 'No active plan. Create a plan first.' };
  }

  const step = currentPlan.steps.find((s) => s.id === stepId);
  if (!step) {
    return { success: false, output: '', error: `Step ${stepId} not found in current plan.` };
  }

  step.status = status;
  return { success: true, output: formatPlan(currentPlan) };
}

export function getCurrentPlan(): Plan | null {
  return currentPlan;
}

export function clearPlan(): void {
  currentPlan = null;
}

export function formatPlan(plan: Plan): string {
  const statusIcon = (s: PlanStep['status']): string => {
    switch (s) {
      case 'done': return '✅';
      case 'in_progress': return '⏳';
      case 'failed': return '❌';
      default: return '⬜';
    }
  };

  const lines = [
    `📋 Plan: ${plan.goal}`,
    '─'.repeat(50),
    ...plan.steps.map((s) => `  ${statusIcon(s.status)} Step ${s.id}: ${s.description}`),
  ];

  return lines.join('\n');
}

export async function executePlanner(input: PlannerInput): Promise<ToolResult> {
  return createPlan(input);
}
