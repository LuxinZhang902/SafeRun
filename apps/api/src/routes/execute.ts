import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { validatePlan, validatePlanSecurity, type Plan } from '../lib/planSchema';
import { executePlan } from '../lib/executor';
import { shouldBlockExecution } from '../lib/rules';
import YAML from 'yaml';

interface ExecuteRequest {
  repoUrl: string;
  plan?: Plan;
  planYaml?: string;
  riskScore?: number;
  riskLevel?: string;
}

export async function executeRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ExecuteRequest }>(
    '/api/execute',
    {
      schema: {
        body: {
          type: 'object',
          required: ['repoUrl'],
          properties: {
            repoUrl: { type: 'string' },
            plan: { type: 'object' },
            planYaml: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ExecuteRequest }>, reply: FastifyReply) => {
      try {
        const { repoUrl, plan, planYaml, riskScore, riskLevel } = request.body;

        // Step 1: Parse and validate plan structure
        let validatedPlan: Plan;
        if (plan) {
          validatedPlan = validatePlan(plan);
        } else if (planYaml) {
          const parsed = YAML.parse(planYaml);
          validatedPlan = validatePlan(parsed);
        } else {
          return reply.status(400).send({
            success: false,
            error: 'Either plan or planYaml must be provided',
          });
        }

        // Step 2: Security check - Block High/Critical risk
        if (riskScore !== undefined && shouldBlockExecution(riskScore)) {
          request.log.warn({
            repoUrl,
            riskScore,
            riskLevel,
          }, 'Execution blocked due to high security risk');

          return reply.status(400).send({
            success: false,
            error: 'Execution blocked: Security risk level is too high',
            details: {
              riskScore,
              riskLevel,
              message: 'This repository contains security threats that prevent safe execution. Please review the security analysis and address the issues before running.',
            },
          });
        }

        // Step 3: Validate plan security (SafeRun guardrails)
        const securityValidation = validatePlanSecurity(validatedPlan);
        if (!securityValidation.valid) {
          request.log.warn({
            repoUrl,
            errors: securityValidation.errors,
          }, 'Plan failed security validation');

          return reply.status(400).send({
            success: false,
            error: 'Plan validation failed: Security violations detected',
            details: {
              violations: securityValidation.errors,
            },
          });
        }

        request.log.info({
          repoUrl,
          planName: validatedPlan.name,
          riskScore,
          riskLevel,
        }, 'Starting secure execution');

        // Step 4: Start execution (async)
        const runId = await executePlan(validatedPlan, repoUrl, (log) => {
          // Logs are stored in memory and can be retrieved via /api/run/:id
          request.log.info(log);
        });

        return reply.send({
          success: true,
          runId,
          message: 'Execution started in secure Daytona workspace',
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute plan',
        });
      }
    }
  );
}
