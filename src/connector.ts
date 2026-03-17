import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { CONFIG } from './config.js';
import type { Message } from './types.js';

let ollamaClient: ChatOllama | null = null;

export function getOllamaClient(): ChatOllama {
  if (!ollamaClient) {
    ollamaClient = new ChatOllama({
      baseUrl: CONFIG.ollama.baseUrl,
      model: CONFIG.ollama.model,
      temperature: CONFIG.ollama.temperature,
    });
  }
  return ollamaClient;
}

export function convertMessagesToLangChain(messages: Message[]): BaseMessage[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      if (m.role === 'user') return new HumanMessage(m.content);
      return new AIMessage(m.content);
    });
}

export async function* streamCompletion(
  systemPrompt: string,
  conversationHistory: BaseMessage[],
  userMessage: string,
): AsyncGenerator<string, void, unknown> {
  const client = getOllamaClient();

  const allMessages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...conversationHistory,
    new HumanMessage(userMessage),
  ];

  const stream = await client.stream(allMessages);

  for await (const chunk of stream) {
    const content = chunk.content;
    if (typeof content === 'string' && content.length > 0) {
      yield content;
    } else if (Array.isArray(content)) {
      for (const part of content as unknown[]) {
        if (typeof part === 'string' && part.length > 0) {
          yield part;
        } else if (typeof part === 'object' && part !== null && 'text' in part) {
          yield String((part as { text: string }).text);
        }
      }
    }
  }
}

export async function getCompletion(
  systemPrompt: string,
  conversationHistory: BaseMessage[],
  userMessage: string,
): Promise<string> {
  const client = getOllamaClient();

  const allMessages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...conversationHistory,
    new HumanMessage(userMessage),
  ];

  const response = await client.invoke(allMessages);
  const content = response.content;

  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => {
        if (typeof c === 'string') return c;
        if (typeof c === 'object' && c !== null && 'text' in c) return String((c as { text: string }).text);
        return '';
      })
      .join('');
  }
  return String(content);
}

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const client = getOllamaClient();
    await client.invoke([new HumanMessage('hi')]);
    return true;
  } catch {
    return false;
  }
}
