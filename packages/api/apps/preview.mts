import { type App as DBAppType } from '../db/schema.mjs';
import { pathToApp } from './disk.mjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { randomid } from '@srcbook/shared';

const execAsync = promisify(exec);

interface PreviewConfig {
  env?: Record<string, string>;
  port?: number;
  ttl?: number;
  resourceLimits?: {
    cpu?: string;
    memory?: string;
  };
}

interface PreviewInfo {
  previewId: string;
  e2bUrl: string;
  status: 'creating' | 'ready' | 'expired';
  expiresAt: string;
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

// Store active previews in memory (in production this should be in a database)
const activePreviews = new Map<string, {
  info: PreviewInfo;
  process?: ReturnType<typeof exec>;
}>();

export async function createPreview(app: DBAppType, config: PreviewConfig = {}): Promise<PreviewInfo> {
  const appPath = pathToApp(app.externalId);
  const previewId = `prev_${randomid()}`;
  
  try {
    // Validate the app path exists
    const stats = await fs.stat(appPath);
    if (!stats.isDirectory()) {
      throw new Error(`App path ${appPath} is not a directory`);
    }

    // Set default configuration
    const port = config.port || 3000;
    const ttl = config.ttl || 60; // 60 minutes default
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();

    // Create preview info
    const previewInfo: PreviewInfo = {
      previewId,
      e2bUrl: `http://localhost:${port}`, // Use local URL for now
      status: 'creating',
      expiresAt,
      resources: {
        cpu: config.resourceLimits?.cpu || '1',
        memory: config.resourceLimits?.memory || '1Gi',
        uptime: 0
      },
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Creating preview sandbox...'
      }]
    };

    // Set up environment
    const env = {
      ...process.env,
      ...config.env,
      PORT: port.toString()
    };

    // Install dependencies
    const { stdout: installOutput } = await execAsync('npm install', {
      cwd: appPath,
      env
    });

    previewInfo.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Dependencies installed'
    });

    // Start the development server
    const devProcess = exec('npm run dev', {
      cwd: appPath,
      env
    });

    // Handle process output
    devProcess.stdout?.on('data', (data) => {
      previewInfo.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: data.toString()
      });
    });

    devProcess.stderr?.on('data', (data) => {
      previewInfo.logs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: data.toString()
      });
    });

    // Update status when server is ready
    devProcess.stdout?.on('data', (data) => {
      if (data.toString().includes('Local:')) {
        previewInfo.status = 'ready';
        previewInfo.logs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Development server started'
        });
      }
    });

    // Store preview info and process
    activePreviews.set(previewId, {
      info: previewInfo,
      process: devProcess
    });

    // Set up auto-expiration
    setTimeout(async () => {
      await deletePreview(app, previewId);
    }, ttl * 60 * 1000);

    return previewInfo;
  } catch (error) {
    console.error('Preview creation failed:', error);
    throw error;
  }
}

export async function getPreview(app: DBAppType, previewId: string): Promise<PreviewInfo | null> {
  const preview = activePreviews.get(previewId);
  return preview?.info || null;
}

export async function deletePreview(app: DBAppType, previewId: string): Promise<boolean> {
  const preview = activePreviews.get(previewId);
  
  if (!preview) {
    return false;
  }

  try {
    // Kill the development server process
    if (preview.process) {
      preview.process.kill();
    }
    
    // Update status
    preview.info.status = 'expired';
    preview.info.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Preview sandbox deleted'
    });

    // Remove from active previews
    activePreviews.delete(previewId);
    
    return true;
  } catch (error) {
    console.error('Failed to delete preview:', error);
    return false;
  }
} 