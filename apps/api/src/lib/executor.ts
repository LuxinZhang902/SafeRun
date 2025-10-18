import { nanoid } from 'nanoid';
import { daytonaClient } from './daytona';
import { type Plan, type PlanStep } from './planSchema';
import { config } from '../config';

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'error' | 'success';
  message: string;
  step?: string;
}

export interface ExecutionResult {
  runId: string;
  status: 'running' | 'success' | 'failed' | 'timeout';
  logs: ExecutionLog[];
  workspaceId?: string;
  previewUrl?: string;
  error?: string;
}

type LogCallback = (log: ExecutionLog) => void;

const executions = new Map<string, ExecutionResult>();

function mapVerbToCommand(step: PlanStep, runtime: string): string[] {
  const verb = step.verb;
  const args = step.args || [];

  // Detect package manager from runtime or use defaults
  const isNode = runtime.includes('node');
  const isPython = runtime.includes('python');
  const isRust = runtime.includes('rust');
  const isGo = runtime.includes('go');

  switch (verb) {
    case 'install':
      if (isNode) {
        // Use pnpm if available (we install it globally), otherwise npm
        return ['pnpm', 'install', ...args];
      } else if (isPython) {
        return ['pip', 'install', '-r', 'requirements.txt', ...args];
      } else if (isRust) {
        return ['cargo', 'fetch', ...args];
      } else if (isGo) {
        return ['go', 'mod', 'download', ...args];
      }
      throw new Error(`Unsupported runtime for install: ${runtime}`);

    case 'build':
      if (isNode) {
        return ['npm', 'run', 'build', ...args];
      } else if (isRust) {
        return ['cargo', 'build', '--release', ...args];
      } else if (isGo) {
        return ['go', 'build', ...args];
      }
      throw new Error(`Unsupported runtime for build: ${runtime}`);

    case 'run':
      if (isNode) {
        return ['npm', 'start', ...args];
      } else if (isPython) {
        return ['python', args[0] || 'main.py', ...args.slice(1)];
      } else if (isRust) {
        return ['cargo', 'run', '--release', ...args];
      } else if (isGo) {
        return ['go', 'run', '.', ...args];
      }
      throw new Error(`Unsupported runtime for run: ${runtime}`);

    case 'test':
      if (isNode) {
        return ['npm', 'test', ...args];
      } else if (isPython) {
        return ['pytest', ...args];
      } else if (isRust) {
        return ['cargo', 'test', ...args];
      } else if (isGo) {
        return ['go', 'test', './...', ...args];
      }
      throw new Error(`Unsupported runtime for test: ${runtime}`);

    default:
      throw new Error(`Unknown verb: ${verb}`);
  }
}

async function executeStep(
  workspaceId: string,
  step: PlanStep,
  runtime: string,
  onLog: LogCallback
): Promise<void> {
  onLog({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Starting step: ${step.name}`,
    step: step.name,
  });

  const command = mapVerbToCommand(step, runtime);
  
  onLog({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Executing: ${command.join(' ')} in ${step.workdir || 'default dir'}`,
    step: step.name,
  });

  try {
    const result = await daytonaClient.exec(workspaceId, command, {
      workdir: step.workdir,
      env: step.env,
      timeout: step.timeout,
    });

    // Debug: Log the raw result
    onLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Command result: exitCode=${result.exitCode}, stdout length=${result.stdout?.length || 0}, stderr length=${result.stderr?.length || 0}`,
      step: step.name,
    });

    // Log stdout if present
    if (result.stdout && result.stdout.trim()) {
      onLog({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Output: ${result.stdout.trim()}`,
        step: step.name,
      });
    }

    // Log stderr if present
    if (result.stderr && result.stderr.trim()) {
      onLog({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Error output: ${result.stderr.trim()}`,
        step: step.name,
      });
    }

    // Check exit code
    if (result.exitCode !== 0) {
      const errorDetails = [
        `Command failed with exit code ${result.exitCode}`,
        result.stdout ? `stdout: ${result.stdout.trim()}` : null,
        result.stderr ? `stderr: ${result.stderr.trim()}` : null,
      ].filter(Boolean).join(' | ');
      
      throw new Error(errorDetails);
    }

    onLog({
      timestamp: new Date().toISOString(),
      level: 'success',
      message: `Step completed: ${step.name}`,
      step: step.name,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    onLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Step failed: ${errorMessage}`,
      step: step.name,
    });
    throw error;
  }
}

export async function executePlan(
  plan: Plan,
  repoUrl: string,
  onLog: LogCallback
): Promise<string> {
  const runId = nanoid();
  const workspaceName = `initium-${runId}`;

  const execution: ExecutionResult = {
    runId,
    status: 'running',
    logs: [],
    workspaceId: undefined,
    previewUrl: undefined,
  };

  executions.set(runId, execution);

  const logWrapper = (log: ExecutionLog) => {
    execution.logs.push(log);
    onLog(log);
  };

  // Auto-destroy timeout
  const destroyTimeout = setTimeout(async () => {
    if (execution.workspaceId) {
      try {
        await daytonaClient.destroy(execution.workspaceId);
        logWrapper({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Workspace auto-destroyed after timeout',
        });
      } catch (error) {
        console.error('Failed to auto-destroy workspace:', error);
      }
    }
  }, config.workspaceTimeoutMs);

  try {
    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Creating workspace for ${plan.name}`,
    });

    // Create workspace
    const workspace = await daytonaClient.createWorkspace({
      name: workspaceName,
      image: plan.runtime,
      memoryMB: config.maxMemoryMB,
      user: 'nonroot',
    });

    execution.workspaceId = workspace.id;

    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'success',
      message: `Workspace created: ${workspace.id}`,
    });

    // Clone repository using git clone
    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Cloning repository: ${repoUrl}`,
    });

    await daytonaClient.exec(workspace.id, ['git', 'clone', repoUrl, 'repo'], {
      timeout: 300000, // 5 min
    });

    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'success',
      message: 'Repository cloned successfully',
    });

    // Check if pnpm is needed and install it
    if (plan.runtime.includes('node')) {
      logWrapper({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Installing pnpm package manager...',
      });

      try {
        await daytonaClient.exec(workspace.id, ['npm', 'install', '-g', 'pnpm'], {
          timeout: 120000, // 2 min
        });

        logWrapper({
          timestamp: new Date().toISOString(),
          level: 'success',
          message: 'pnpm installed successfully',
        });
      } catch (error) {
        logWrapper({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Failed to install pnpm, will use npm instead',
        });
      }
    }

    // Execute steps in the cloned repository
    for (const step of plan.steps) {
      // Skip 'run' step as it's a long-running process
      // The built static files will be served automatically
      if (step.verb === 'run') {
        logWrapper({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Skipping run step - application is built and ready`,
          step: step.name,
        });
        continue;
      }

      await executeStep(
        workspace.id,
        { ...step, workdir: step.workdir || 'repo' },
        plan.runtime,
        logWrapper
      );
    }

    // Expose ports if specified
    if (plan.ports && plan.ports.length > 0) {
      logWrapper({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Exposing ports: ${plan.ports.join(', ')}`,
      });

      for (const port of plan.ports) {
        try {
          const exposed = await daytonaClient.expose(workspace.id, port);
          execution.previewUrl = exposed.url;
          logWrapper({
            timestamp: new Date().toISOString(),
            level: 'success',
            message: `🌐 Preview URL: ${exposed.url}`,
          });
        } catch (error) {
          logWrapper({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Failed to expose port ${port}: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
    }

    execution.status = 'success';
    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'success',
      message: 'Execution completed successfully',
    });

    // Destroy workspace after success
    await daytonaClient.destroy(workspace.id);
    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Workspace destroyed',
    });

  } catch (error) {
    execution.status = 'failed';
    execution.error = error instanceof Error ? error.message : String(error);
    
    logWrapper({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Execution failed: ${execution.error}`,
    });

    // Cleanup on failure
    if (execution.workspaceId) {
      try {
        await daytonaClient.destroy(execution.workspaceId);
      } catch (cleanupError) {
        console.error('Failed to cleanup workspace:', cleanupError);
      }
    }
  } finally {
    clearTimeout(destroyTimeout);
  }

  return runId;
}

export function getExecution(runId: string): ExecutionResult | undefined {
  return executions.get(runId);
}

export function getAllExecutions(): ExecutionResult[] {
  return Array.from(executions.values());
}
