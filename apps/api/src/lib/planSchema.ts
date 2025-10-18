import { z } from 'zod';

export const PlanStepSchema = z.object({
  name: z.string(),
  verb: z.enum(['install', 'build', 'run', 'test']),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  workdir: z.string().optional(),
  timeout: z.number().optional(),
});

export const PlanSchema = z.object({
  version: z.literal('1.0'),
  name: z.string(),
  runtime: z.string(),
  steps: z.array(PlanStepSchema),
  ports: z.array(z.number()).optional(),
  healthcheck: z.string().optional(),
});

export type Plan = z.infer<typeof PlanSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;

export function validatePlan(data: unknown): Plan {
  return PlanSchema.parse(data);
}

/**
 * Security validation for execution plans
 * Enforces SafeRun guardrails
 */
export function validatePlanSecurity(plan: Plan): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

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
