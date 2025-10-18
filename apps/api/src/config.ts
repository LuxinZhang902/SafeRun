import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  daytonaBaseUrl: process.env.DAYTONA_BASE_URL || 'http://localhost:3986',
  workspaceTimeoutMs: parseInt(process.env.WORKSPACE_TIMEOUT_MS || '1800000', 10),
  maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB || '2048', 10),
  allowedEgressDomains: (process.env.ALLOWED_EGRESS_DOMAINS || 'github.com,npmjs.com,registry.npmjs.org').split(','),
};

// Validate required config
if (!config.anthropicApiKey) {
  console.warn('WARNING: ANTHROPIC_API_KEY is not set');
}

if (!config.daytonaBaseUrl) {
  console.warn('WARNING: DAYTONA_BASE_URL is not set');
}
