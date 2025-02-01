import { getConfig } from '../config.mjs';
import { getModel } from './config.mjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface CodeExecutionResult {
  text: string;
  error?: string;
}

/**
 * Execute Python code in a controlled environment
 */
export async function executeCode(code: string): Promise<CodeExecutionResult> {
  try {
    const config = await getConfig();
    if (!config.openaiKey) {
      throw new Error('OpenAI API key is not set');
    }

    // Create a temporary Python file
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, `code_${Date.now()}.py`);
    
    // Write the code to the file
    await fs.writeFile(tempFile, code);

    try {
      // Execute the Python code
      const { stdout, stderr } = await execAsync(`python3 ${tempFile}`);
      
      return {
        text: stdout,
        error: stderr || undefined
      };
    } finally {
      // Clean up the temporary file
      await fs.unlink(tempFile);
    }
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to execute code'
    };
  }
}

/**
 * Upload a file to the execution environment
 */
export async function uploadFile(filePath: string, content: string | Buffer): Promise<void> {
  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  const targetPath = path.join(tempDir, path.basename(filePath));
  await fs.writeFile(targetPath, content);
}

/**
 * Download a file from the execution environment
 */
export async function downloadFile(filePath: string): Promise<Buffer> {
  const tempDir = path.join(process.cwd(), 'temp');
  const targetPath = path.join(tempDir, path.basename(filePath));
  return fs.readFile(targetPath);
} 