import { Daytona, type DaytonaConfig, Sandbox } from '@daytonaio/sdk';
import { config } from '../config';

interface CreateWorkspaceParams {
  name: string;
  image: string;
  memoryMB?: number;
  user?: string;
}

interface ExecOptions {
  workdir?: string;
  env?: Record<string, string>;
  timeout?: number;
}

class DaytonaClient {
  private daytona: Daytona;
  private sandboxes: Map<string, Sandbox>;

  constructor(daytonaConfig: DaytonaConfig) {
    this.daytona = new Daytona(daytonaConfig);
    this.sandboxes = new Map();
  }

  async createWorkspace(params: CreateWorkspaceParams) {
    // Create sandbox using official SDK
    const sandbox = await this.daytona.create({
      image: params.image,
      resources: {
        memory: params.memoryMB || 2048,
      },
    });

    // Store sandbox reference
    this.sandboxes.set(sandbox.id, sandbox);

    return {
      id: sandbox.id,
      name: params.name,
      status: 'running',
    };
  }

  async exec(workspaceId: string, command: string[], options: ExecOptions = {}) {
    // Get the sandbox instance
    const sandbox = this.sandboxes.get(workspaceId);
    if (!sandbox) {
      throw new Error(`Sandbox ${workspaceId} not found`);
    }

    // Execute command in sandbox using official SDK
    const result = await sandbox.process.executeCommand(
      command.join(' '),
      options.workdir,
      options.env,
      options.timeout ? options.timeout / 1000 : undefined // Convert ms to seconds
    );

    return {
      stdout: result.result || '',
      stderr: '', // Daytona SDK doesn't separate stderr
      exitCode: result.exitCode,
    };
  }

  async expose(workspaceId: string, port: number) {
    // Get the sandbox instance
    const sandbox = this.sandboxes.get(workspaceId);
    if (!sandbox) {
      throw new Error(`Sandbox ${workspaceId} not found`);
    }

    // Get preview URL (Daytona automatically exposes ports)
    const previewUrl = `https://${sandbox.id}-${port}.daytona.app`;

    return {
      url: previewUrl,
      port,
    };
  }

  async destroy(workspaceId: string) {
    // Get the sandbox instance
    const sandbox = this.sandboxes.get(workspaceId);
    if (!sandbox) {
      throw new Error(`Sandbox ${workspaceId} not found`);
    }

    // Delete the sandbox
    await sandbox.delete();

    // Remove from map
    this.sandboxes.delete(workspaceId);

    return { success: true };
  }
}

// Initialize with Daytona config
const daytonaConfig: DaytonaConfig = {
  apiKey: config.daytonaApiKey || '',
  apiUrl: config.daytonaBaseUrl,
};

export const daytonaClient = new DaytonaClient(daytonaConfig);
