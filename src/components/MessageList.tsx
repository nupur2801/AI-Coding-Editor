import React from 'react';
import { Box, Static } from 'ink';
import { MessageItem } from './MessageItem.js';
import { StreamingMessage } from './StreamingMessage.js';
import { TodoList } from './TodoList.js';
import type { Message, Plan } from '../types.js';

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isProcessing: boolean;
  currentPlan: Plan | null;
}

export function MessageList({ messages, streamingContent, isProcessing, currentPlan }: MessageListProps): React.ReactElement {
  return (
    <Box flexDirection="column" flexGrow={1}>
      <Static items={messages}>
        {(message: Message) => (
          <MessageItem key={message.id} message={message} />
        )}
      </Static>

      {currentPlan && isProcessing && (
        <TodoList plan={currentPlan} />
      )}

      {(isProcessing || streamingContent) && (
        <StreamingMessage
          content={streamingContent}
          isThinking={isProcessing && !streamingContent}
        />
      )}
    </Box>
  );
}
