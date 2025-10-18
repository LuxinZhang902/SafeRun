import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  daytonaBaseUrl: process.env.DAYTONA_BASE_URL || 'https://api.daytona.io',
  daytonaApiKey: process.env.DAYTONA_API_KEY || '',
  workspaceTimeoutMs: parseInt(process.env.WORKSPACE_TIMEOUT_MS || '1800000', 10),
  maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB || '2048', 10),
  allowedEgressDomains: (process.env.ALLOWED_EGRESS_DOMAINS || 'github.com,npmjs.com,registry.npmjs.org').split(','),
};

// Validate required config
if (!config.anthropicApiKey) {
  console.warn('WARNING: ANTHROPIC_API_KEY is not set');
}

if (!config.daytonaApiKey) {
  console.warn('WARNING: DAYTONA_API_KEY is not set - execution will fail');
}

if (!config.daytonaBaseUrl) {
  console.warn('WARNING: DAYTONA_BASE_URL is not set');
}
