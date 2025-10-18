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
declare class DaytonaClient {
    private baseUrl;
    constructor(baseUrl: string);
    createWorkspace(params: {
        name: string;
        image: string;
        memoryMB: number;
        user?: string;
    }): Promise<DaytonaWorkspace>;
    exec(workspaceId: string, command: string[], options?: {
        workdir?: string;
        env?: Record<string, string>;
        timeout?: number;
    }): Promise<ExecResult>;
    expose(workspaceId: string, port: number): Promise<ExposeResult>;
    destroy(workspaceId: string): Promise<void>;
    getWorkspace(workspaceId: string): Promise<DaytonaWorkspace>;
}
export declare const daytonaClient: DaytonaClient;
export {};
//# sourceMappingURL=daytona.d.ts.map