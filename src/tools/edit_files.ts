import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import { CONFIG } from '../config.js';
import type {
  ToolResult,
  EditFileInput,
  ReadFileInput,
  DeleteFileInput,
  CreateFileInput,
  ListFilesInput,
  MoveFileInput,
} from '../types.js';

function resolvePath(filePath: string): string {
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(process.cwd(), filePath);
}

function getTrashPath(originalPath: string): string {
  const trashDir = path.resolve(process.cwd(), CONFIG.fs.trashDir);
  const basename = path.basename(originalPath);
  const timestamp = Date.now();
  return path.join(trashDir, `${timestamp}_${basename}`);
}

export async function readFile(input: ReadFileInput): Promise<ToolResult> {
  try {
    const filePath = resolvePath(input.path);
    if (!fs.existsSync(filePath)) {
      return { success: false, output: '', error: `File not found: ${input.path}` };
    }
    const content = fs.readFileSync(filePath, CONFIG.fs.encoding);
    return { success: true, output: content };
  } catch (err) {
    return { success: false, output: '', error: String(err) };
  }
}

export async function createFile(input: CreateFileInput): Promise<ToolResult> {
  try {
    const filePath = resolvePath(input.path);
    const dir = path.dirname(filePath);
    await fsExtra.ensureDir(dir);
    fs.writeFileSync(filePath, input.content, CONFIG.fs.encoding);
    return { success: true, output: `Created file: ${input.path}` };
  } catch (err) {
    return { success: false, output: '', error: String(err) };
  }
}

export async function editFile(input: EditFileInput): Promise<ToolResult> {
  try {
    const filePath = resolvePath(input.path);
    const dir = path.dirname(filePath);
    await fsExtra.ensureDir(dir);
    fs.writeFileSync(filePath, input.content, CONFIG.fs.encoding);
    return { success: true, output: `Updated file: ${input.path}` };
  } catch (err) {
    return { success: false, output: '', error: String(err) };
  }
}

export async function deleteFile(input: DeleteFileInput): Promise<ToolResult> {
  try {
    const filePath = resolvePath(input.path);
    if (!fs.existsSync(filePath)) {
      return { success: false, output: '', error: `File not found: ${input.path}` };
    }

    if (input.moveToTrash !== false) {
      const trashPath = getTrashPath(filePath);
      await fsExtra.ensureDir(path.dirname(trashPath));
      await fsExtra.move(filePath, trashPath);
      return { success: true, output: `Moved to trash: ${input.path} → ${trashPath}` };
    } else {
      fs.rmSync(filePath, { recursive: true, force: true });
      return { success: true, output: `Permanently deleted: ${input.path}` };
    }
  } catch (err) {
    return { success: false, output: '', error: String(err) };
  }
}

export async function listFiles(input: ListFilesInput): Promise<ToolResult> {
  try {
    const dirPath = resolvePath(input.directory);
    if (!fs.existsSync(dirPath)) {
      return { success: false, output: '', error: `Directory not found: ${input.directory}` };
    }

    function walk(dir: string, depth: number = 0): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const results: string[] = [];
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
        const indent = '  '.repeat(depth);
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(dirPath, fullPath);
        if (entry.isDirectory()) {
          results.push(`${indent}📁 ${relPath}/`);
          if (input.recursive !== false && depth < 5) {
            results.push(...walk(fullPath, depth + 1));
          }
        } else {
          if (!input.pattern || relPath.includes(input.pattern)) {
            const stat = fs.statSync(fullPath);
            const size = stat.size < 1024 ? `${stat.size}B` : `${(stat.size / 1024).toFixed(1)}KB`;
            results.push(`${indent}📄 ${relPath} (${size})`);
          }
        }
      }
      return results;
    }

    const files = walk(dirPath);
    const output = files.length > 0 ? files.join('\n') : '(empty directory)';
    return { success: true, output: `Directory: ${input.directory}\n${output}` };
  } catch (err) {
    return { success: false, output: '', error: String(err) };
  }
}

export async function moveFile(input: MoveFileInput): Promise<ToolResult> {
  try {
    const srcPath = resolvePath(input.source);
    const destPath = resolvePath(input.destination);

    if (!fs.existsSync(srcPath)) {
      return { success: false, output: '', error: `Source not found: ${input.source}` };
    }

    await fsExtra.ensureDir(path.dirname(destPath));
    await fsExtra.move(srcPath, destPath, { overwrite: true });
    return { success: true, output: `Moved: ${input.source} → ${input.destination}` };
  } catch (err) {
    return { success: false, output: '', error: String(err) };
  }
}
