export const CONFIG = {
  app: {
    name: 'coding-editor',
    version: '1.0.0',
    displayName: 'Coding Editor',
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'phi3:latest',
    temperature: 0.2,
    maxTokens: 4096,
    streaming: true,
  },
  agent: {
    maxIterations: 50,
    thinkingDelay: 0,
  },
  ui: {
    headerColor: 'cyan',
    userColor: 'green',
    assistantColor: 'white',
    errorColor: 'red',
    warningColor: 'yellow',
    toolColor: 'magenta',
    dimColor: 'gray',
    maxHistoryDisplay: 100,
  },
  fs: {
    trashDir: 'trash',
    encoding: 'utf-8' as BufferEncoding,
  },
} as const;

export const TOKYO = {
  bg: '#1a1b26',
  bgDark: '#16161e',
  bgHighlight: '#292e42',
  blue: '#7aa2f7',
  cyan: '#7dcfff',
  green: '#9ece6a',
  magenta: '#bb9af7',
  orange: '#ff9e64',
  red: '#f7768e',
  yellow: '#e0af68',
  white: '#c0caf5',
  dim: '#565f89',
  comment: '#414868',
} as const;

export const ASCII_BANNER = `
  ██████╗ ██████╗ ██████╗ ███████╗    ███████╗██████╗ 
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔════╝██╔══██╗
 ██║     ██║   ██║██║  ██║█████╗      █████╗  ██║  ██║
 ██║     ██║   ██║██║  ██║██╔══╝      ██╔══╝  ██║  ██║
 ╚██████╗╚██████╔╝██████╔╝███████╗    ███████╗██████╔╝
  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚══════╝╚═════╝ 
`.trim();

export const TOOL_NAMES = {
  EDIT_FILE: 'edit_file',
  READ_FILE: 'read_file',
  DELETE_FILE: 'delete_file',
  CREATE_FILE: 'create_file',
  LIST_FILES: 'list_files',
  MOVE_FILE: 'move_file',
  PLANNER: 'planner',
  RUN_COMMAND: 'run_command',
} as const;

export const SYSTEM_PROMPT = `You are an expert AI coding assistant embedded in a terminal-based code editor.
You have access to tools to read, create, edit, delete, and manage files, run shell commands, and plan tasks.

When given a task:
1. Think step by step about what needs to be done
2. Use the planner tool FIRST for any multi-step task to create a clear todo list
3. Use run_command to execute shell commands (pwd, ls, git, npm, etc.)
4. Use file tools to read/create/edit/delete files
5. Keep working in a loop until the task is fully complete
6. Report clearly what was accomplished

ALWAYS:
- Start complex tasks with the planner tool to show a todo list
- Use run_command when the user asks to run a command or needs system info (like pwd, which folder, etc.)
- Read files before editing to understand context
- Write clean, well-structured code following best practices
- Verify changes after making them

IMPORTANT: You are in an AGENTIC LOOP. Keep calling tools until the task is 100% complete.
Only give a final response (no JSON tool call) when the task is fully done.`;
