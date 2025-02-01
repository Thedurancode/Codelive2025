import { type App as DBAppType } from '../db/schema.mjs';
import { pathToApp, getFlatFilesForApp } from './disk.mjs';
import { getCurrentCommitSha } from './git.mjs';
import { randomid } from '@srcbook/shared';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface SandboxConfig {
  env?: Record<string, string>;
  port?: number;
  ttl?: number;
  resourceLimits?: {
    cpu?: string;
    memory?: string;
  };
}

interface SandboxInfo {
  sandboxId: string;
  url: string;
  status: 'creating' | 'ready' | 'error';
  error?: string;
  expiresAt: string;
  commitSha: string;
  resources: {
    cpu: string;
    memory: string;
    uptime: number;
  };
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

// Store active sandboxes in memory (in production this should be in a database)
const activeSandboxes = new Map<string, {
  info: SandboxInfo;
  containerId?: string;
}>();

export async function createSandbox(app: DBAppType, config: SandboxConfig = {}): Promise<SandboxInfo> {
  const appPath = pathToApp(app.externalId);
  const sandboxId = `sb_${randomid()}`;
  
  try {
    // Get current commit SHA
    const commitSha = await getCurrentCommitSha(app);
    
    // Get all files from the app
    const files = await getFlatFilesForApp(app.externalId);

    // Set default configuration
    const port = config.port || 3000;
    const ttl = config.ttl || 60; // 60 minutes default
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();

    // Create sandbox info
    const sandboxInfo: SandboxInfo = {
      sandboxId,
      url: `http://localhost:${port}`,
      status: 'creating',
      commitSha,
      expiresAt,
      resources: {
        cpu: config.resourceLimits?.cpu || '1',
        memory: config.resourceLimits?.memory || '1Gi',
        uptime: 0
      },
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Creating sandbox...'
      }]
    };

    // Create temporary directory for the sandbox
    const tempDir = path.join(process.cwd(), 'temp', sandboxId);
    await fs.mkdir(tempDir, { recursive: true });

    // Copy all files to temp directory
    for (const file of files) {
      const filePath = path.join(tempDir, file.filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);
    }

    // Create Dockerfile
    const dockerfile = `
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE ${port}
CMD ["npm", "run", "dev"]
    `.trim();
    await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfile);

    try {
      // Build and run Docker container
      const { stdout: containerId } = await execAsync(`
        docker build -t ${sandboxId} ${tempDir} &&
        docker run -d \
          --name ${sandboxId} \
          -p ${port}:${port} \
          ${config.resourceLimits?.cpu ? `--cpus=${config.resourceLimits.cpu}` : ''} \
          ${config.resourceLimits?.memory ? `--memory=${config.resourceLimits.memory}` : ''} \
          ${Object.entries(config.env || {}).map(([k, v]) => `-e ${k}=${v}`).join(' ')} \
          ${sandboxId}
      `);

      sandboxInfo.status = 'ready';
      sandboxInfo.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Sandbox ready'
      });

      // Store sandbox info
      activeSandboxes.set(sandboxId, {
        info: sandboxInfo,
        containerId: containerId.trim()
      });

      // Set up auto-expiration
      setTimeout(async () => {
        await deleteSandbox(app, sandboxId);
      }, ttl * 60 * 1000);

    } catch (error) {
      sandboxInfo.status = 'error';
      sandboxInfo.error = error instanceof Error ? error.message : 'Failed to initialize sandbox';
      sandboxInfo.logs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: sandboxInfo.error
      });
    }

    return sandboxInfo;
  } catch (error) {
    console.error('Sandbox creation failed:', error);
    throw error;
  }
}

export async function getSandbox(app: DBAppType, sandboxId: string): Promise<SandboxInfo | null> {
  const sandbox = activeSandboxes.get(sandboxId);
  return sandbox?.info || null;
}

export async function deleteSandbox(app: DBAppType, sandboxId: string): Promise<boolean> {
  const sandbox = activeSandboxes.get(sandboxId);
  
  if (!sandbox) {
    return false;
  }

  try {
    // Stop and remove Docker container
    if (sandbox.containerId) {
      await execAsync(`docker stop ${sandboxId} && docker rm ${sandboxId}`);
    }

    // Clean up temporary directory
    const tempDir = path.join(process.cwd(), 'temp', sandboxId);
    await fs.rm(tempDir, { recursive: true, force: true });
    
    // Update status
    sandbox.info.status = 'error';
    sandbox.info.error = 'Sandbox expired';
    sandbox.info.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Sandbox deleted'
    });

    // Remove from active sandboxes
    activeSandboxes.delete(sandboxId);
    
    return true;
  } catch (error) {
    console.error('Failed to delete sandbox:', error);
    return false;
  }
} 