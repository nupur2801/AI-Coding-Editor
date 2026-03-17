export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

export type ToolName =
  | 'edit_file'
  | 'read_file'
  | 'delete_file'
  | 'create_file'
  | 'list_files'
  | 'move_file'
  | 'planner'
  | 'run_command';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolName?: ToolName;
  toolInput?: Record<string, unknown>;
  toolOutput?: string;
  isStreaming?: boolean;
  isError?: boolean;
  isToolCall?: boolean;
  isToolResult?: boolean;
  commandOutput?: CommandOutput;
}

export interface PlanStep {
  id: number;
  description: string;
  status: 'pending' | 'in_progress' | 'done' | 'failed';
}

export interface Plan {
  goal: string;
  steps: PlanStep[];
  createdAt: Date;
}

export interface AgentState {
  isRunning: boolean;
  currentPlan: Plan | null;
  iterationCount: number;
  lastError: string | null;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface EditFileInput {
  path: string;
  content: string;
}

export interface ReadFileInput {
  path: string;
}

export interface DeleteFileInput {
  path: string;
  moveToTrash?: boolean;
}

export interface CreateFileInput {
  path: string;
  content: string;
}

export interface ListFilesInput {
  directory: string;
  recursive?: boolean;
  pattern?: string;
}

export interface MoveFileInput {
  source: string;
  destination: string;
}

export interface PlannerInput {
  goal: string;
  steps: string[];
}

export interface AppState {
  messages: Message[];
  agentState: AgentState;
  inputValue: string;
  isProcessing: boolean;
  streamingContent: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface CommandOutput {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration: number;
}
