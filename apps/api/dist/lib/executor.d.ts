import { type Plan } from './planSchema';
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
export declare function executePlan(plan: Plan, repoUrl: string, onLog: LogCallback): Promise<string>;
export declare function getExecution(runId: string): ExecutionResult | undefined;
export declare function getAllExecutions(): ExecutionResult[];
export {};
//# sourceMappingURL=executor.d.ts.map