"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daytonaClient = void 0;
const config_1 = require("../config");
class DaytonaClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }
    async createWorkspace(params) {
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
                    allowedEgressDomains: config_1.config.allowedEgressDomains,
                },
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create workspace: ${error}`);
        }
        return response.json();
    }
    async exec(workspaceId, command, options) {
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
        return response.json();
    }
    async expose(workspaceId, port) {
        const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}/expose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to expose port: ${error}`);
        }
        return response.json();
    }
    async destroy(workspaceId) {
        const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to destroy workspace: ${error}`);
        }
    }
    async getWorkspace(workspaceId) {
        const response = await fetch(`${this.baseUrl}/workspace/${workspaceId}`);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get workspace: ${error}`);
        }
        return response.json();
    }
}
exports.daytonaClient = new DaytonaClient(config_1.config.daytonaBaseUrl);
//# sourceMappingURL=daytona.js.map