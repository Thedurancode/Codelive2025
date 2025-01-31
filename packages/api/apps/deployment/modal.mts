import { type App as DBAppType } from '../../db/schema.mjs';
import { pathToApp } from '../disk.mjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface ModalDeploymentConfig {
  token: string;
  projectId: string;
}

export async function deployToModal(app: DBAppType, config: ModalDeploymentConfig) {
  const appPath = pathToApp(app.externalId);
  
  try {
    // Validate the app path exists
    console.log('Validating app path:', appPath);
    const stats = await fs.stat(appPath);
    if (!stats.isDirectory()) {
      throw new Error(`App path ${appPath} is not a directory`);
    }

    // Install Modal Python SDK
    console.log('Installing Modal Python SDK...');
    await execAsync('pip3 install modal-client || pip install modal-client', { cwd: appPath });
    
    // Configure Modal token
    console.log('Configuring Modal token...');
    await execAsync(`modal token set --token-id ${config.token}`, { cwd: appPath });

    // Build the app first
    console.log('Building app...');
    const { stdout: buildOutput } = await execAsync('npm run build', { cwd: appPath });
    console.log('Build output:', buildOutput);
    console.log('Build completed');

    // Create a simple Modal deployment script
    const modalScript = `
from modal import Stub, web_endpoint

stub = Stub("${app.name}")

@stub.function()
@web_endpoint()
def serve():
    return {"status": "ok"}

if __name__ == "__main__":
    stub.serve()
`;

    const modalScriptPath = path.join(appPath, 'modal_deploy.py');
    await fs.writeFile(modalScriptPath, modalScript);

    // Deploy using Modal CLI
    console.log('Deploying to Modal...');
    const { stdout: deployOutput } = await execAsync('modal deploy modal_deploy.py', { cwd: appPath });
    console.log('Deploy output:', deployOutput);

    // Extract deployment URL from the output
    const urlMatch = deployOutput.match(/Deployment URL: (https:\/\/[^\s]+)/);
    const deploymentUrl = urlMatch ? urlMatch[1] : null;

    if (!deploymentUrl) {
      throw new Error('Could not extract deployment URL from Modal output');
    }

    return {
      success: true,
      url: deploymentUrl,
    };
  } catch (error) {
    console.error('Modal deployment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getModalDeploymentStatus(app: DBAppType, config: ModalDeploymentConfig) {
  try {
    const { stdout } = await execAsync('modal status', {
      cwd: pathToApp(app.externalId),
      env: {
        ...process.env,
        MODAL_TOKEN_ID: config.token,
      },
    });
    
    return {
      success: true,
      status: stdout.includes('running') ? 'running' : 'stopped',
    };
  } catch (error) {
    console.error('Failed to get Modal deployment status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 
