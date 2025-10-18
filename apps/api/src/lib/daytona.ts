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

    // Store sandbox in map
    this.sandboxes.set(sandbox.id, sandbox);

    return {
      id: sandbox.id,
      name: params.name,
      status: 'running',
    };
  }

  async connectToExistingSandbox(sandboxId: string) {
    try {
      console.log(`[Daytona] Connecting to existing sandbox: ${sandboxId}`);
      
      // Check if already in map
      if (this.sandboxes.has(sandboxId)) {
        console.log(`[Daytona] Sandbox already in cache`);
        return this.sandboxes.get(sandboxId)!;
      }
      
      const daytona = this.getDaytona();
      
      // The Daytona SDK doesn't have a direct "get" method
      // We need to create a new connection, which will connect to existing if ID matches
      console.log(`[Daytona] Note: Daytona SDK doesn't support reconnecting to existing sandboxes`);
      console.log(`[Daytona] Sandbox ${sandboxId} exists but is not in our local cache`);
      console.log(`[Daytona] You can access it at: https://3000-${sandboxId}.proxy.daytona.works`);
      
      throw new Error(`Cannot reconnect to existing sandbox. Daytona SDK limitation.`);
    } catch (error) {
      console.error(`[Daytona] Failed to connect to sandbox:`, error);
      throw error;
    }
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

  async cloneRepo(workspaceId: string, repoUrl: string, targetPath: string) {
    // Get the sandbox instance
    const sandbox = this.sandboxes.get(workspaceId);
    if (!sandbox) {
      throw new Error(`Sandbox ${workspaceId} not found`);
    }

    try {
      console.log(`[Daytona] Cloning repository: ${repoUrl} to ${targetPath}`);
      console.log(`[Daytona] Sandbox ID: ${workspaceId}`);
      console.log(`[Daytona] Starting git clone operation...`);
      
      // Use Daytona SDK's built-in git.clone() method with timeout
      const clonePromise = sandbox.git.clone(repoUrl, targetPath);
      
      // Add a timeout to detect if it's hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Git clone timeout after 120 seconds')), 120000);
      });
      
      await Promise.race([clonePromise, timeoutPromise]);
      
      console.log(`[Daytona] Repository cloned successfully`);
    } catch (error) {
      console.error(`[Daytona] Git clone error:`, error);
      console.error(`[Daytona] Error details:`, JSON.stringify(error, null, 2));
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async expose(workspaceId: string, port: number) {
    // Get the sandbox instance
    const sandbox = this.sandboxes.get(workspaceId);
    if (!sandbox) {
      throw new Error(`Sandbox ${workspaceId} not found`);
    }

    try {
      // Use Daytona SDK's getPreviewLink to get the actual preview URL
      console.log(`[Daytona] Getting preview link for port ${port}...`);
      const previewLink = await sandbox.getPreviewLink(port);
      
      console.log(`[Daytona] Preview URL: ${previewLink.url}`);
      
      return {
        url: previewLink.url,
        port,
      };
    } catch (error) {
      console.error(`[Daytona] Failed to get preview link:`, error);
      throw new Error(`Failed to expose port ${port}: ${error instanceof Error ? error.message : String(error)}`);
    }
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

  async destroyById(sandboxId: string) {
    try {
      console.log(`[Daytona] Destroying sandbox by ID: ${sandboxId}`);
      const daytona = this.getDaytona();
      const sandbox = await daytona.create({ id: sandboxId });
      await sandbox.delete();
      this.sandboxes.delete(sandboxId);
      console.log(`[Daytona] Destroyed: ${sandboxId}`);
      return { success: true };
    } catch (error) {
      console.error(`[Daytona] Failed to destroy ${sandboxId}:`, error);
      throw error;
    }
  }
}

// Initialize with Daytona config
const daytonaConfig: DaytonaConfig = {
  apiKey: config.daytonaApiKey || '',
  apiUrl: config.daytonaBaseUrl,
};

export const daytonaClient = new DaytonaClient(daytonaConfig);
