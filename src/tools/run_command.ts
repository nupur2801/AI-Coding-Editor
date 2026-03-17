import { spawn } from 'child_process';
import type { ToolResult, CommandOutput } from '../types.js';

export interface RunCommandInput {
  command: string;
  cwd?: string;
  timeout?: number;
}

export async function runCommand(input: RunCommandInput): Promise<ToolResult & { commandOutput?: CommandOutput }> {
  const startTime = Date.now();
  const timeout = input.timeout ?? 30000;
  const cwd = input.cwd ?? process.cwd();

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : '/bin/sh';
    const shellFlag = isWindows ? '/c' : '-c';

    const child = spawn(shell, [shellFlag, input.command], {
      cwd,
      env: { ...process.env },
      windowsHide: true,
    });

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill();
      const duration = Date.now() - startTime;
      const commandOutput: CommandOutput = {
        command: input.command,
        exitCode: null,
        stdout: stdout.trim(),
        stderr: `[TIMEOUT after ${timeout}ms]\n${stderr.trim()}`,
        duration,
      };
      resolve({
        success: false,
        output: formatCommandOutput(commandOutput),
        error: `Command timed out after ${timeout}ms`,
        commandOutput,
      });
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      const exitCode = code ?? 0;
      const success = exitCode === 0;

      const commandOutput: CommandOutput = {
        command: input.command,
        exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        duration,
      };

      resolve({
        success,
        output: formatCommandOutput(commandOutput),
        error: !success ? `Exited with code ${exitCode}` : undefined,
        commandOutput,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      const commandOutput: CommandOutput = {
        command: input.command,
        exitCode: -1,
        stdout: stdout.trim(),
        stderr: err.message,
        duration,
      };
      resolve({
        success: false,
        output: formatCommandOutput(commandOutput),
        error: err.message,
        commandOutput,
      });
    });
  });
}

function formatCommandOutput(cmd: CommandOutput): string {
  const lines: string[] = [];
  lines.push(`$ ${cmd.command}`);
  lines.push(`Exit: ${cmd.exitCode ?? 'killed'} | Duration: ${cmd.duration}ms`);
  if (cmd.stdout) {
    lines.push('─── stdout ───');
    lines.push(cmd.stdout);
  }
  if (cmd.stderr) {
    lines.push('─── stderr ───');
    lines.push(cmd.stderr);
  }
  return lines.join('\n');
}
