import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { planRoutes } from './routes/plan';
import { executeRoutes } from './routes/execute';
import { runRoutes } from './routes/run';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'info' : 'warn',
  },
});

async function start() {
  try {
    // Register CORS with proper headers for SSE
    await fastify.register(cors, {
      origin: config.nodeEnv === 'development' ? true : false,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Type'],
    });

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(planRoutes);
    await fastify.register(executeRoutes);
    await fastify.register(runRoutes);

    // Start server
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log(`🚀 SafeRun API server running on http://localhost:${config.port}`);
    console.log(`📊 Health check: http://localhost:${config.port}/health`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();
