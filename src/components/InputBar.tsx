import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { TOKYO } from '../config.js';

interface InputBarProps {
  onSubmit: (value: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function InputBar({ onSubmit, isDisabled, placeholder }: InputBarProps): React.ReactElement {
  const { exit } = useApp();
  const [value, setValue] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  useInput(
    (input: string, key: Record<string, boolean>) => {
      if (key['return']) {
        const trimmed = value.trim();
        if (trimmed) {
          onSubmit(trimmed);
          setValue('');
          setCursorPos(0);
        }
        return;
      }

      if (key['backspace'] || key['delete']) {
        if (cursorPos > 0) {
          const newVal = value.slice(0, cursorPos - 1) + value.slice(cursorPos);
          setValue(newVal);
          setCursorPos(cursorPos - 1);
        }
        return;
      }

      if (key['leftArrow']) {
        setCursorPos(Math.max(0, cursorPos - 1));
        return;
      }

      if (key['rightArrow']) {
        setCursorPos(Math.min(value.length, cursorPos + 1));
        return;
      }

      if (key['ctrl'] && input === 'c') {
        exit();
        return;
      }

      if (key['ctrl'] && input === 'u') {
        setValue('');
        setCursorPos(0);
        return;
      }

      if (!key['ctrl'] && !key['meta'] && input) {
        const newVal = value.slice(0, cursorPos) + input + value.slice(cursorPos);
        setValue(newVal);
        setCursorPos(cursorPos + input.length);
      }
    },
    { isActive: !isDisabled },
  );

  const isPlaceholder = value.length === 0;
  const before = value.slice(0, cursorPos);
  const cursor = value[cursorPos] ?? ' ';
  const after = value.slice(cursorPos + 1);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box gap={1}>
        {isDisabled ? (
          <>
            <Text color={TOKYO.dim}>◉</Text>
            <Text color={TOKYO.dim}>Agent is working...</Text>
          </>
        ) : isPlaceholder ? (
          <>
            <Text color={TOKYO.green} bold>❯</Text>
            <Text color={TOKYO.comment}>{placeholder ?? 'Type your task here...'}</Text>
          </>
        ) : (
          <>
            <Text color={TOKYO.green} bold>❯</Text>
            <Text>
              <Text color={TOKYO.white}>{before}</Text>
              <Text backgroundColor={TOKYO.blue} color={TOKYO.bg}>{cursor}</Text>
              <Text color={TOKYO.white}>{after}</Text>
            </Text>
          </>
        )}
      </Box>
      <Box marginTop={0}>
        <Text color={TOKYO.comment}>  enter ↵ submit  │  ctrl+u clear  │  ctrl+c exit</Text>
      </Box>
    </Box>
  );
}
