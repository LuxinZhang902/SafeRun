"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSchema = exports.PlanStepSchema = void 0;
exports.validatePlan = validatePlan;
exports.validatePlanSecurity = validatePlanSecurity;
const zod_1 = require("zod");
exports.PlanStepSchema = zod_1.z.object({
    name: zod_1.z.string(),
    verb: zod_1.z.enum(['install', 'build', 'run', 'test']),
    args: zod_1.z.array(zod_1.z.string()).optional(),
    env: zod_1.z.record(zod_1.z.string()).optional(),
    workdir: zod_1.z.string().optional(),
    timeout: zod_1.z.number().optional(),
});
exports.PlanSchema = zod_1.z.object({
    version: zod_1.z.literal('1.0'),
    name: zod_1.z.string(),
    runtime: zod_1.z.string(),
    steps: zod_1.z.array(exports.PlanStepSchema),
    ports: zod_1.z.array(zod_1.z.number()).optional(),
    healthcheck: zod_1.z.string().optional(),
});
function validatePlan(data) {
    return exports.PlanSchema.parse(data);
}
/**
 * Security validation for execution plans
 * Enforces SafeRun guardrails
 */
function validatePlanSecurity(plan) {
    const errors = [];
    // Check for dangerous patterns
    for (const step of plan.steps) {
        // Check for shell injection attempts in args
        if (step.args) {
            for (const arg of step.args) {
                if (arg.includes('&&') || arg.includes('||') || arg.includes(';') || arg.includes('|')) {
                    errors.push(`Step "${step.name}": Shell chaining detected in args`);
                }
                if (arg.includes('$(') || arg.includes('`')) {
                    errors.push(`Step "${step.name}": Command substitution detected in args`);
                }
            }
        }
        // Check environment variables for secrets
        if (step.env) {
            for (const [key, value] of Object.entries(step.env)) {
                if (value.match(/sk-ant-|ghp_|AKIA|-----BEGIN/)) {
                    errors.push(`Step "${step.name}": Hardcoded secret detected in env.${key}`);
                }
            }
        }
        // Check workdir for path traversal
        if (step.workdir && (step.workdir.includes('..') || step.workdir.startsWith('/'))) {
            errors.push(`Step "${step.name}": Unsafe workdir path detected`);
        }
    }
    // Validate ports
    if (plan.ports) {
        for (const port of plan.ports) {
            if (port < 1 || port > 65535) {
                errors.push(`Invalid port number: ${port}`);
            }
            if (port < 1024) {
                errors.push(`Privileged port detected: ${port} (use ports >= 1024)`);
            }
        }
    }
    // Check for multiple services (not allowed in MVP)
    const runSteps = plan.steps.filter(s => s.verb === 'run');
    if (runSteps.length > 1) {
        errors.push('Multiple "run" steps detected - only one service allowed');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=planSchema.js.map