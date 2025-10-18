"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    daytonaBaseUrl: process.env.DAYTONA_BASE_URL || 'http://localhost:3986',
    workspaceTimeoutMs: parseInt(process.env.WORKSPACE_TIMEOUT_MS || '1800000', 10),
    maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB || '2048', 10),
    allowedEgressDomains: (process.env.ALLOWED_EGRESS_DOMAINS || 'github.com,npmjs.com,registry.npmjs.org').split(','),
};
// Validate required config
if (!exports.config.anthropicApiKey) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set');
}
if (!exports.config.daytonaBaseUrl) {
    console.warn('WARNING: DAYTONA_BASE_URL is not set');
}
//# sourceMappingURL=config.js.map