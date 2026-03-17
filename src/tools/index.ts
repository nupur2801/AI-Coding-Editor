import { readFile, createFile, editFile, deleteFile, listFiles, moveFile } from './edit_files.js';
import { executePlanner } from './planner.js';
import { runCommand } from './run_command.js';
import { TOOL_NAMES } from '../config.js';
import type { ToolResult } from '../types.js';

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

export async function executeTool(call: ToolCall): Promise<ToolResult> {
  switch (call.name) {
    case TOOL_NAMES.READ_FILE:
      return readFile(call.input as { path: string });

    case TOOL_NAMES.CREATE_FILE:
      return createFile(call.input as { path: string; content: string });

    case TOOL_NAMES.EDIT_FILE:
      return editFile(call.input as { path: string; content: string });

    case TOOL_NAMES.DELETE_FILE:
      return deleteFile(call.input as { path: string; moveToTrash?: boolean });

    case TOOL_NAMES.LIST_FILES:
      return listFiles(call.input as { directory: string; recursive?: boolean; pattern?: string });

    case TOOL_NAMES.MOVE_FILE:
      return moveFile(call.input as { source: string; destination: string });

    case TOOL_NAMES.PLANNER:
      return executePlanner(call.input as { goal: string; steps: string[] });

    case TOOL_NAMES.RUN_COMMAND:
      return runCommand(call.input as { command: string; cwd?: string; timeout?: number });

    default:
      return { success: false, output: '', error: `Unknown tool: ${call.name}` };
  }
}

export const TOOL_DEFINITIONS = `
Available tools (respond with JSON to call a tool):

1. read_file
   Input: { "tool": "read_file", "path": "<file_path>" }
   Description: Read the contents of a file.

2. create_file
   Input: { "tool": "create_file", "path": "<file_path>", "content": "<file_content>" }
   Description: Create a new file with given content.

3. edit_file
   Input: { "tool": "edit_file", "path": "<file_path>", "content": "<new_content>" }
   Description: Overwrite a file with new content.

4. delete_file
   Input: { "tool": "delete_file", "path": "<file_path>", "moveToTrash": true }
   Description: Delete a file. By default moves to trash folder for safety.

5. list_files
   Input: { "tool": "list_files", "directory": "<dir_path>", "recursive": true }
   Description: List files and directories recursively.

6. move_file
   Input: { "tool": "move_file", "source": "<src_path>", "destination": "<dest_path>" }
   Description: Move or rename a file.

7. planner
   Input: { "tool": "planner", "goal": "<goal_description>", "steps": ["step1", "step2", ...] }
   Description: Create a structured plan for complex multi-step tasks. USE THIS FIRST for any multi-step task.

8. run_command
   Input: { "tool": "run_command", "command": "<shell_command>", "cwd": "<optional_dir>" }
   Description: Execute a shell command and return stdout/stderr. Use for pwd, ls, git, npm, etc.

To use a tool, respond with ONLY a JSON block like:
\`\`\`json
{ "tool": "<tool_name>", ... }
\`\`\`

When you are done with all tasks and have nothing more to do, respond normally without a JSON block.
`;

export { readFile, createFile, editFile, deleteFile, listFiles, moveFile, executePlanner, runCommand };
