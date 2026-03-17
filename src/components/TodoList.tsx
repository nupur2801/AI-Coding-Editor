import React from 'react';
import { Box, Text } from 'ink';
import { TOKYO } from '../config.js';
import type { Plan } from '../types.js';

interface TodoListProps {
  plan: Plan;
}

function stepIcon(status: string): string {
  switch (status) {
    case 'done': return '✔';
    case 'in_progress': return '▶';
    case 'failed': return '✖';
    default: return '○';
  }
}

function stepColor(status: string): string {
  switch (status) {
    case 'done': return TOKYO.green;
    case 'in_progress': return TOKYO.yellow;
    case 'failed': return TOKYO.red;
    default: return TOKYO.dim;
  }
}

export function TodoList({ plan }: TodoListProps): React.ReactElement {
  const done = plan.steps.filter((s) => s.status === 'done').length;
  const total = plan.steps.length;

  return (
    <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
      <Box gap={2}>
        <Text color={TOKYO.magenta} bold>📋 Plan</Text>
        <Text color={TOKYO.white}>{plan.goal}</Text>
        <Text color={TOKYO.dim}>{done}/{total}</Text>
      </Box>
      <Box flexDirection="column" paddingLeft={2} marginTop={0}>
        {plan.steps.map((step) => (
          <Box key={step.id} gap={1}>
            <Text color={stepColor(step.status)}>{stepIcon(step.status)}</Text>
            <Text color={step.status === 'done' ? TOKYO.dim : TOKYO.white}>
              {step.description}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
