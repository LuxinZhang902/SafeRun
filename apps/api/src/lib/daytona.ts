import { config } from '../config';

export interface DaytonaWorkspace {
  id: string;
  name: string;
  status: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ExposeResult {
  url: string;
  port: number;
}

class DaytonaClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async createWorkspace(params: {
    name: string;
    image: string;
    memoryMB: number;
    user?: string;
  }): Promise<DaytonaWorkspace> {
    const response = await fetch(`${this.baseUrl}/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: params.name,
        image: params.image,
        resources: {
          memory: `${params.memoryMB}M`,
        },
        user: params.user || 'nonroot',
        securityContext: {
          runAsNonRoot: true,
          allowedEgressDomains: config.allowedEgressDomains,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create workspace: ${error}`);
    }

    return response.json() as Promise<DaytonaWorkspace>;
  }

  async exec(workspaceId: string, command: string[], options?: {
    workdir?: string;
    env?: Record<string, string>;
    timeout?: number;
  }): Promise<ExecResult> {
    const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        workdir: options?.workdir || '/workspace',
        env: options?.env || {},
        timeout: options?.timeout || 300000, // 5 min default
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exec command: ${error}`);
    }

    return response.json() as Promise<ExecResult>;
  }

  async expose(workspaceId: string, port: number): Promise<ExposeResult> {
    const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}/expose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to expose port: ${error}`);
    }

    return response.json() as Promise<ExposeResult>;
  }

  async destroy(workspaceId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to destroy workspace: ${error}`);
    }
  }

  async getWorkspace(workspaceId: string): Promise<DaytonaWorkspace> {
    const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get workspace: ${error}`);
    }

    return response.json() as Promise<DaytonaWorkspace>;
  }
}

export const daytonaClient = new DaytonaClient(config.daytonaBaseUrl);
