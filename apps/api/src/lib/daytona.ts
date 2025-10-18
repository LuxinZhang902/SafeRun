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
  private daytona: Daytona | null = null;
  private sandboxes: Map<string, Sandbox>;
  private config: DaytonaConfig;

  constructor(daytonaConfig: DaytonaConfig) {
    this.config = daytonaConfig;
    this.sandboxes = new Map();
  }

  private getDaytona(): Daytona {
    if (!this.daytona) {
      if (!this.config.apiKey) {
        throw new Error('DAYTONA_API_KEY is not set. Please add it to your .env file.');
      }
      this.daytona = new Daytona(this.config);
    }
    return this.daytona;
  }

  async createWorkspace(params: CreateWorkspaceParams) {
    // Create sandbox using official SDK
    const daytona = this.getDaytona();
    
    // Convert MB to GiB for Daytona SDK (SDK expects memory in GiB)
    const memoryMB = params.memoryMB || 2048;
    const memoryGiB = Math.ceil(memoryMB / 1024); // Convert MB to GiB, max 8 GiB
    const memoryToUse = Math.min(memoryGiB, 8); // Ensure we don't exceed 8 GiB limit
    
    const sandbox = await daytona.create({
      image: params.image,
      resources: {
        memory: memoryToUse, // In GiB (e.g., 2 = 2 GiB)
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

    try {
      // Execute command in sandbox using official SDK
      console.log(`[Daytona] Executing command: ${command.join(' ')}`);
      console.log(`[Daytona] Working directory: ${options.workdir || 'default'}`);
      
      const result = await sandbox.process.executeCommand(
        command.join(' '),
        options.workdir,
        options.env,
        options.timeout ? options.timeout / 1000 : undefined // Convert ms to seconds
      );

      console.log(`[Daytona] Command completed: exitCode=${result.exitCode}`);
      console.log(`[Daytona] Result output length: ${result.result?.length || 0}`);

      return {
        stdout: result.result || '',
        stderr: '', // Daytona SDK doesn't separate stderr
        exitCode: result.exitCode,
      };
    } catch (error) {
      console.error(`[Daytona] Command execution error:`, error);
      throw new Error(`Failed to exec command: ${error instanceof Error ? error.message : String(error)}`);
    }
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
