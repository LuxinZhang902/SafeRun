import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getExecution, type ExecutionLog } from '../lib/executor';

interface RunParams {
  id: string;
}

export async function runRoutes(fastify: FastifyInstance) {
  // GET /api/run/:id - Stream logs via SSE
  fastify.get<{ Params: RunParams }>(
    '/api/run/:id',
    async (request: FastifyRequest<{ Params: RunParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const execution = getExecution(id);

      if (!execution) {
        return reply.status(404).send({
          success: false,
          error: 'Execution not found',
        });
      }

      // Set SSE headers with CORS
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      // Send existing logs
      for (const log of execution.logs) {
        reply.raw.write(`data: ${JSON.stringify(log)}\n\n`);
      }

      // If execution is complete, send final status and close
      if (execution.status !== 'running') {
        const finalEvent = {
          type: 'complete',
          status: execution.status,
          previewUrl: execution.previewUrl,
          error: execution.error,
        };
        reply.raw.write(`data: ${JSON.stringify(finalEvent)}\n\n`);
        reply.raw.end();
        return;
      }

      // Poll for new logs (simplified - in production use proper event emitter)
      let lastLogCount = execution.logs.length;
      const pollInterval = setInterval(() => {
        const currentExecution = getExecution(id);
        if (!currentExecution) {
          clearInterval(pollInterval);
          reply.raw.end();
          return;
        }

        // Send new logs
        const newLogs = currentExecution.logs.slice(lastLogCount);
        for (const log of newLogs) {
          reply.raw.write(`data: ${JSON.stringify(log)}\n\n`);
        }
        lastLogCount = currentExecution.logs.length;

        // Check if execution is complete
        if (currentExecution.status !== 'running') {
          const finalEvent = {
            type: 'complete',
            status: currentExecution.status,
            previewUrl: currentExecution.previewUrl,
            error: currentExecution.error,
          };
          reply.raw.write(`data: ${JSON.stringify(finalEvent)}\n\n`);
          clearInterval(pollInterval);
          reply.raw.end();
        }
      }, 1000);

      // Cleanup on client disconnect
      request.raw.on('close', () => {
        clearInterval(pollInterval);
      });
    }
  );

  // GET /api/run/:id/status - Get execution status (non-streaming)
  fastify.get<{ Params: RunParams }>(
    '/api/run/:id/status',
    async (request: FastifyRequest<{ Params: RunParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const execution = getExecution(id);

      if (!execution) {
        return reply.status(404).send({
          success: false,
          error: 'Execution not found',
        });
      }

      return reply.send({
        success: true,
        execution: {
          runId: execution.runId,
          status: execution.status,
          previewUrl: execution.previewUrl,
          error: execution.error,
          logCount: execution.logs.length,
        },
      });
    }
  );
}
