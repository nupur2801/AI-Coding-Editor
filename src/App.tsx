import React, { useState, useCallback } from 'react';
import { Box } from 'ink';
import { Header } from './components/Header.js';
import { MessageList } from './components/MessageList.js';
import { InputBar } from './components/InputBar.js';
import { StatusBar } from './components/StatusBar.js';
import { agent } from './agent.js';
import type { Message, AgentState } from './types.js';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function App(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [agentState, setAgentState] = useState<AgentState>({
    isRunning: false,
    currentPlan: null,
    iterationCount: 0,
    lastError: null,
  });

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: generateId(),
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSubmit = useCallback(
    async (input: string) => {
      if (isProcessing) return;

      addMessage({ role: 'user', content: input });
      setIsProcessing(true);
      setStreamingContent('');

      try {
        let accumulated = '';

        const runGen = agent.run(input, (msg) => {
          if (msg.role === 'tool') {
            if (accumulated.trim()) {
              addMessage({ role: 'assistant', content: accumulated.trim() });
              accumulated = '';
              setStreamingContent('');
            }
            addMessage(msg);
          }
          setAgentState(agent.getState());
        });

        for await (const chunk of runGen) {
          accumulated += chunk;
          setStreamingContent(accumulated);
          setAgentState(agent.getState());
        }

        if (accumulated.trim()) {
          addMessage({ role: 'assistant', content: accumulated.trim() });
          setStreamingContent('');
        }
      } catch (err) {
        addMessage({
          role: 'assistant',
          content: `Error: ${String(err)}`,
          isError: true,
        });
      } finally {
        setIsProcessing(false);
        setStreamingContent('');
        setAgentState(agent.getState());
      }
    },
    [isProcessing, addMessage],
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        isProcessing={isProcessing}
        currentPlan={agentState.currentPlan}
      />
      <StatusBar agentState={agentState} isProcessing={isProcessing} />
      <InputBar
        onSubmit={handleSubmit}
        isDisabled={isProcessing}
        placeholder="Describe what you want me to do..."
      />
    </Box>
  );
}
