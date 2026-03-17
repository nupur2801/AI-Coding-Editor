import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { streamCompletion } from './connector.js';
import { executeTool, TOOL_DEFINITIONS } from './tools/index.js';
import { getCurrentPlan } from './tools/planner.js';
import { SYSTEM_PROMPT, TOOL_NAMES } from './config.js';
import type { Message, AgentState, CommandOutput } from './types.js';

function extractToolCall(text: string): Record<string, unknown> | null {
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {
      return null;
    }
  }

  const inlineJsonMatch = text.match(/\{[\s\S]*"tool"[\s\S]*\}/);
  if (inlineJsonMatch) {
    try {
      return JSON.parse(inlineJsonMatch[0]);
    } catch {
      return null;
    }
  }

  return null;
}

export class Agent {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private state: AgentState = {
    isRunning: false,
    currentPlan: null,
    iterationCount: 0,
    lastError: null,
  };

  getState(): AgentState {
    return { ...this.state };
  }

  reset(): void {
    this.conversationHistory = [];
    this.state = {
      isRunning: false,
      currentPlan: null,
      iterationCount: 0,
      lastError: null,
    };
  }

  async *run(
    userInput: string,
    onMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void,
  ): AsyncGenerator<string, void, unknown> {
    this.state.isRunning = true;
    this.state.iterationCount = 0;
    this.state.lastError = null;

    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${TOOL_DEFINITIONS}`;

    const historyMessages = this.conversationHistory.map((m) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
    );

    let currentUserMessage = userInput;
    let iterationCount = 0;
    const maxIterations = 50;

    while (iterationCount < maxIterations) {
      iterationCount++;
      this.state.iterationCount = iterationCount;

      let fullResponse = '';

      try {
        const streamGen = streamCompletion(fullSystemPrompt, historyMessages, currentUserMessage);

        for await (const chunk of streamGen) {
          fullResponse += chunk;
          yield chunk;
        }
      } catch (err) {
        const errorMsg = `Connection error: ${String(err)}`;
        this.state.lastError = errorMsg;
        onMessage({ role: 'assistant', content: errorMsg, isError: true });
        break;
      }

      const toolCall = extractToolCall(fullResponse);

      if (!toolCall) {
        this.conversationHistory.push({ role: 'user', content: currentUserMessage });
        this.conversationHistory.push({ role: 'assistant', content: fullResponse });
        this.state.isRunning = false;
        break;
      }

      const toolName = String(toolCall.tool ?? '');
      const toolInput = { ...toolCall } as Record<string, unknown>;
      delete toolInput['tool'];

      onMessage({
        role: 'tool',
        content: `Using tool: ${toolName}`,
        toolName: toolName as Message['toolName'],
        toolInput,
        isToolCall: true,
      });

      historyMessages.push(new HumanMessage(currentUserMessage));
      historyMessages.push(new AIMessage(fullResponse));

      const rawResult = await executeTool({ name: toolName, input: toolInput });
      const result = rawResult as typeof rawResult & { commandOutput?: CommandOutput };

      if (toolName === TOOL_NAMES.PLANNER) {
        this.state.currentPlan = getCurrentPlan();
      }

      const toolResultContent = result.success
        ? `Tool result (${toolName}):\n${result.output}`
        : `Tool error (${toolName}): ${result.error}`;

      onMessage({
        role: 'tool',
        content: toolResultContent,
        toolName: toolName as Message['toolName'],
        toolOutput: result.output || result.error,
        isError: !result.success,
        isToolResult: true,
        commandOutput: result.commandOutput,
      });

      historyMessages.push(new HumanMessage(toolResultContent));
      currentUserMessage = toolResultContent;

      yield '\n';
    }

    if (iterationCount >= maxIterations) {
      const limitMsg = `\n⚠️ Reached maximum iterations (${maxIterations}). Task may be incomplete.`;
      yield limitMsg;
      onMessage({ role: 'assistant', content: limitMsg, isError: true });
    }

    this.state.isRunning = false;
  }
}

export const agent = new Agent();
