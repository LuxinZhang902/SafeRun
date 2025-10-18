"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePlan = executePlan;
exports.getExecution = getExecution;
exports.getAllExecutions = getAllExecutions;
const nanoid_1 = require("nanoid");
const daytona_1 = require("./daytona");
const config_1 = require("../config");
const executions = new Map();
function mapVerbToCommand(step, runtime) {
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
                // Prefer pnpm, fallback to npm
                return ['pnpm', 'install', ...args];
            }
            else if (isPython) {
                return ['pip', 'install', '-r', 'requirements.txt', ...args];
            }
            else if (isRust) {
                return ['cargo', 'fetch', ...args];
            }
            else if (isGo) {
                return ['go', 'mod', 'download', ...args];
            }
            throw new Error(`Unsupported runtime for install: ${runtime}`);
        case 'build':
            if (isNode) {
                return ['npm', 'run', 'build', ...args];
            }
            else if (isRust) {
                return ['cargo', 'build', '--release', ...args];
            }
            else if (isGo) {
                return ['go', 'build', ...args];
            }
            throw new Error(`Unsupported runtime for build: ${runtime}`);
        case 'run':
            if (isNode) {
                return ['npm', 'start', ...args];
            }
            else if (isPython) {
                return ['python', args[0] || 'main.py', ...args.slice(1)];
            }
            else if (isRust) {
                return ['cargo', 'run', '--release', ...args];
            }
            else if (isGo) {
                return ['go', 'run', '.', ...args];
            }
            throw new Error(`Unsupported runtime for run: ${runtime}`);
        case 'test':
            if (isNode) {
                return ['npm', 'test', ...args];
            }
            else if (isPython) {
                return ['pytest', ...args];
            }
            else if (isRust) {
                return ['cargo', 'test', ...args];
            }
            else if (isGo) {
                return ['go', 'test', './...', ...args];
            }
            throw new Error(`Unsupported runtime for test: ${runtime}`);
        default:
            throw new Error(`Unknown verb: ${verb}`);
    }
}
async function executeStep(workspaceId, step, runtime, onLog) {
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
        message: `Executing: ${command.join(' ')}`,
        step: step.name,
    });
    try {
        const result = await daytona_1.daytonaClient.exec(workspaceId, command, {
            workdir: step.workdir,
            env: step.env,
            timeout: step.timeout,
        });
        if (result.stdout) {
            onLog({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: result.stdout,
                step: step.name,
            });
        }
        if (result.stderr) {
            onLog({
                timestamp: new Date().toISOString(),
                level: 'error',
                message: result.stderr,
                step: step.name,
            });
        }
        if (result.exitCode !== 0) {
            throw new Error(`Command failed with exit code ${result.exitCode}`);
        }
        onLog({
            timestamp: new Date().toISOString(),
            level: 'success',
            message: `Step completed: ${step.name}`,
            step: step.name,
        });
    }
    catch (error) {
        onLog({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Step failed: ${error instanceof Error ? error.message : String(error)}`,
            step: step.name,
        });
        throw error;
    }
}
async function executePlan(plan, repoUrl, onLog) {
    const runId = (0, nanoid_1.nanoid)();
    const workspaceName = `initium-${runId}`;
    const execution = {
        runId,
        status: 'running',
        logs: [],
        workspaceId: undefined,
        previewUrl: undefined,
    };
    executions.set(runId, execution);
    const logWrapper = (log) => {
        execution.logs.push(log);
        onLog(log);
    };
    // Auto-destroy timeout
    const destroyTimeout = setTimeout(async () => {
        if (execution.workspaceId) {
            try {
                await daytona_1.daytonaClient.destroy(execution.workspaceId);
                logWrapper({
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: 'Workspace auto-destroyed after timeout',
                });
            }
            catch (error) {
                console.error('Failed to auto-destroy workspace:', error);
            }
        }
    }, config_1.config.workspaceTimeoutMs);
    try {
        logWrapper({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Creating workspace for ${plan.name}`,
        });
        // Create workspace
        const workspace = await daytona_1.daytonaClient.createWorkspace({
            name: workspaceName,
            image: plan.runtime,
            memoryMB: config_1.config.maxMemoryMB,
            user: 'nonroot',
        });
        execution.workspaceId = workspace.id;
        logWrapper({
            timestamp: new Date().toISOString(),
            level: 'success',
            message: `Workspace created: ${workspace.id}`,
        });
        // Clone repository
        logWrapper({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Cloning repository: ${repoUrl}`,
        });
        await daytona_1.daytonaClient.exec(workspace.id, ['git', 'clone', repoUrl, '/workspace/repo'], {
            workdir: '/workspace',
            timeout: 300000, // 5 min
        });
        logWrapper({
            timestamp: new Date().toISOString(),
            level: 'success',
            message: 'Repository cloned successfully',
        });
        // Execute steps
        for (const step of plan.steps) {
            await executeStep(workspace.id, { ...step, workdir: step.workdir || '/workspace/repo' }, plan.runtime, logWrapper);
        }
        // Expose ports if specified
        if (plan.ports && plan.ports.length > 0) {
            for (const port of plan.ports) {
                try {
                    const exposed = await daytona_1.daytonaClient.expose(workspace.id, port);
                    execution.previewUrl = exposed.url;
                    logWrapper({
                        timestamp: new Date().toISOString(),
                        level: 'success',
                        message: `Port ${port} exposed at: ${exposed.url}`,
                    });
                }
                catch (error) {
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
        await daytona_1.daytonaClient.destroy(workspace.id);
        logWrapper({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Workspace destroyed',
        });
    }
    catch (error) {
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
                await daytona_1.daytonaClient.destroy(execution.workspaceId);
            }
            catch (cleanupError) {
                console.error('Failed to cleanup workspace:', cleanupError);
            }
        }
    }
    finally {
        clearTimeout(destroyTimeout);
    }
    return runId;
}
function getExecution(runId) {
    return executions.get(runId);
}
function getAllExecutions() {
    return Array.from(executions.values());
}
//# sourceMappingURL=executor.js.map