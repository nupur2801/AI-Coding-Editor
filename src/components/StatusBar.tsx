import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { TOKYO } from '../config.js';
import type { AgentState } from '../types.js';

interface StatusBarProps {
  agentState: AgentState;
  isProcessing: boolean;
}

export function StatusBar({ agentState, isProcessing }: StatusBarProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={TOKYO.comment}>{'─'.repeat(72)}</Text>
      </Box>
      <Box gap={2} paddingLeft={1} paddingTop={0}>
        {isProcessing ? (
          <>
            <Text color={TOKYO.magenta}>
              <Spinner type="dots" />
            </Text>
            <Text color={TOKYO.magenta} bold>Agent running</Text>
            {agentState.iterationCount > 0 && (
              <Text color={TOKYO.dim}>
                step {agentState.iterationCount}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text color={TOKYO.green}>◉</Text>
            <Text color={TOKYO.dim}>ready</Text>
          </>
        )}
        {agentState.lastError && (
          <Text color={TOKYO.red}>
            ⚠ {agentState.lastError.slice(0, 60)}
          </Text>
        )}
      </Box>
    </Box>
  );
}
