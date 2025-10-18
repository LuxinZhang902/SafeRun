"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRoutes = executeRoutes;
const planSchema_1 = require("../lib/planSchema");
const executor_1 = require("../lib/executor");
const rules_1 = require("../lib/rules");
const yaml_1 = __importDefault(require("yaml"));
async function executeRoutes(fastify) {
    fastify.post('/api/execute', {
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
    }, async (request, reply) => {
        try {
            const { repoUrl, plan, planYaml, riskScore, riskLevel } = request.body;
            // Step 1: Parse and validate plan structure
            let validatedPlan;
            if (plan) {
                validatedPlan = (0, planSchema_1.validatePlan)(plan);
            }
            else if (planYaml) {
                const parsed = yaml_1.default.parse(planYaml);
                validatedPlan = (0, planSchema_1.validatePlan)(parsed);
            }
            else {
                return reply.status(400).send({
                    success: false,
                    error: 'Either plan or planYaml must be provided',
                });
            }
            // Step 2: Security check - Block High/Critical risk
            if (riskScore !== undefined && (0, rules_1.shouldBlockExecution)(riskScore)) {
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
            const securityValidation = (0, planSchema_1.validatePlanSecurity)(validatedPlan);
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
            const runId = await (0, executor_1.executePlan)(validatedPlan, repoUrl, (log) => {
                // Logs are stored in memory and can be retrieved via /api/run/:id
                request.log.info(log);
            });
            return reply.send({
                success: true,
                runId,
                message: 'Execution started in secure Daytona workspace',
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to execute plan',
            });
        }
    });
}
//# sourceMappingURL=execute.js.map