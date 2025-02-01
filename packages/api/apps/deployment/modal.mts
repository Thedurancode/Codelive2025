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

    // Ensure virtual environment exists
    console.log('Setting up virtual environment...');
    await execAsync('python3 -m venv .venv', { cwd: appPath });
    await execAsync('source .venv/bin/activate && pip install modal', { cwd: appPath, shell: '/bin/bash' });

    // Create a Python script that uses Modal SDK directly
    const modalScript = `
import os
import modal
import sys

# Set Modal token
os.environ["MODAL_TOKEN_ID"] = "${config.token}"

# Create a new Modal app
app = modal.App("${app.name}")

@app.function()
@modal.web_endpoint()
def serve():
    return {"status": "ok", "app": "${app.name}"}

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        app.run()
    else:
        modal.runner.deploy_app(app)
`;

    const modalScriptPath = path.join(appPath, 'modal_deploy.py');
    await fs.writeFile(modalScriptPath, modalScript);

    // Run the Modal deployment script using the virtual environment's Python
    console.log('Deploying to Modal...');
    const { stdout: deployOutput } = await execAsync('source .venv/bin/activate && python3 modal_deploy.py', { 
      cwd: appPath,
      env: {
        ...process.env,
        MODAL_TOKEN_ID: config.token,
      },
      shell: '/bin/bash'
    });
    console.log('Deploy output:', deployOutput);

    // Extract deployment URL from the output or generate a predictable one
    const urlMatch = deployOutput.match(/Deployment URL: (https:\/\/[^\s]+)/);
    const deploymentUrl = urlMatch ? urlMatch[1] : `https://${app.name}-${app.externalId.substring(0, 6)}.modal.run`;

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
  const appPath = pathToApp(app.externalId);
  
  try {
    const { stdout } = await execAsync('source .venv/bin/activate && python3 modal_deploy.py --serve', {
      cwd: appPath,
      env: {
        ...process.env,
        MODAL_TOKEN_ID: config.token,
      },
      shell: '/bin/bash'
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
