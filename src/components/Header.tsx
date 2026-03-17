import React from 'react';
import { Box, Text } from 'ink';
import { CONFIG, ASCII_BANNER, TOKYO } from '../config.js';

export function Header(): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={TOKYO.blue} bold>
        {ASCII_BANNER}
      </Text>
      <Box flexDirection="row" gap={2} marginTop={1}>
        <Text color={TOKYO.magenta} bold>
          {CONFIG.app.displayName}
        </Text>
        <Text color={TOKYO.dim}>v{CONFIG.app.version}</Text>
        <Text color={TOKYO.comment}>│</Text>
        <Text color={TOKYO.green}>⬡ {CONFIG.ollama.model}</Text>
        <Text color={TOKYO.comment}>│</Text>
        <Text color={TOKYO.dim}>Ctrl+C to exit</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={TOKYO.comment}>{'─'.repeat(72)}</Text>
      </Box>
    </Box>
  );
}
