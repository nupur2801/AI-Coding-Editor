import React from 'react';
import { Box, Text } from 'ink';
import { TOKYO } from '../config.js';
import type { Message } from '../types.js';

interface MessageItemProps {
  message: Message;
}

function getToolIcon(toolName?: string): string {
  switch (toolName) {
    case 'run_command': return '❯_';
    case 'read_file': return '👁 ';
    case 'create_file': return '✚ ';
    case 'edit_file': return '✎ ';
    case 'delete_file': return '✖ ';
    case 'list_files': return '⊞ ';
    case 'move_file': return '⇄ ';
    case 'planner': return '📋';
    default: return '⚙ ';
  }
}

export function MessageItem({ message }: MessageItemProps): React.ReactElement {
  const ts = new Date(message.timestamp).toLocaleTimeString();

  if (message.role === 'user') {
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box gap={1}>
          <Text color={TOKYO.green} bold>❯ You</Text>
          <Text color={TOKYO.dim}>{ts}</Text>
        </Box>
        <Box paddingLeft={2}>
          <Text color={TOKYO.white} wrap="wrap">{message.content}</Text>
        </Box>
      </Box>
    );
  }

  if (message.role === 'assistant') {
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box gap={1}>
          <Text color={TOKYO.blue} bold>◆ Editor</Text>
          <Text color={TOKYO.dim}>{ts}</Text>
        </Box>
        <Box paddingLeft={2}>
          <Text color={message.isError ? TOKYO.red : TOKYO.white} wrap="wrap">
            {message.content}
          </Text>
        </Box>
      </Box>
    );
  }

  if (message.role === 'tool') {
    if (message.isToolCall) {
      const icon = getToolIcon(message.toolName);
      const inputPreview = message.toolInput
        ? Object.entries(message.toolInput)
            .map(([k, v]) => `${k}=${JSON.stringify(v).slice(0, 60)}`)
            .join(' ')
        : '';
      return (
        <Box flexDirection="column" marginBottom={0} paddingLeft={2}>
          <Box gap={1}>
            <Text color={TOKYO.magenta} bold>{icon} {message.toolName}</Text>
            <Text color={TOKYO.dim}>{ts}</Text>
          </Box>
          {inputPreview ? (
            <Box paddingLeft={2}>
              <Text color={TOKYO.dim} wrap="wrap">{inputPreview}</Text>
            </Box>
          ) : null}
        </Box>
      );
    }

    if (message.isToolResult) {
      if (message.commandOutput) {
        const cmd = message.commandOutput;
        const success = cmd.exitCode === 0;
        return (
          <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
            <Box gap={1}>
              <Text color={success ? TOKYO.green : TOKYO.red} bold>
                {success ? '✔' : '✖'} $ {cmd.command}
              </Text>
              <Text color={TOKYO.dim}>exit:{cmd.exitCode ?? 'killed'}</Text>
              <Text color={TOKYO.comment}>{cmd.duration}ms</Text>
            </Box>
            {cmd.stdout ? (
              <Box flexDirection="column" paddingLeft={2} marginTop={0}>
                <Text color={TOKYO.comment}>┌─ stdout</Text>
                <Box paddingLeft={2}>
                  <Text color={TOKYO.cyan} wrap="wrap">{cmd.stdout}</Text>
                </Box>
              </Box>
            ) : null}
            {cmd.stderr ? (
              <Box flexDirection="column" paddingLeft={2}>
                <Text color={TOKYO.comment}>┌─ stderr</Text>
                <Box paddingLeft={2}>
                  <Text color={TOKYO.yellow} wrap="wrap">{cmd.stderr}</Text>
                </Box>
              </Box>
            ) : null}
          </Box>
        );
      }

      return (
        <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
          <Box gap={1}>
            <Text color={message.isError ? TOKYO.red : TOKYO.green} bold>
              {message.isError ? '✖' : '✔'} {message.toolName}
            </Text>
            <Text color={TOKYO.dim}>{ts}</Text>
          </Box>
          <Box paddingLeft={2} marginTop={0}>
            <Text color={message.isError ? TOKYO.red : TOKYO.dim} wrap="wrap">
              {(message.toolOutput ?? message.content).slice(0, 500)}
            </Text>
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box paddingLeft={2}>
        <Text color={TOKYO.dim} wrap="wrap">{message.content}</Text>
      </Box>
    </Box>
  );
}
