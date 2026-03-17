import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { TOKYO } from '../config.js';

interface StreamingMessageProps {
  content: string;
  isThinking?: boolean;
}

export function StreamingMessage({ content, isThinking }: StreamingMessageProps): React.ReactElement {
  if (isThinking && !content) {
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box gap={1}>
          <Text color={TOKYO.blue} bold>◆ Editor</Text>
        </Box>
        <Box paddingLeft={2} gap={1}>
          <Text color={TOKYO.magenta}>
            <Spinner type="dots" />
          </Text>
          <Text color={TOKYO.dim}>thinking...</Text>
        </Box>
      </Box>
    );
  }

  if (!content) return <Box />;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text color={TOKYO.blue} bold>◆ Editor</Text>
        <Text color={TOKYO.dim}>streaming</Text>
      </Box>
      <Box paddingLeft={2}>
        <Text color={TOKYO.white} wrap="wrap">
          {content}
          <Text color={TOKYO.blue}>▌</Text>
        </Text>
      </Box>
    </Box>
  );
}
