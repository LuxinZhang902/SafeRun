import { describe, it, expect } from 'vitest';
import { validatePlan, PlanSchema } from './planSchema';

describe('planSchema', () => {
  it('should validate a valid plan', () => {
    const validPlan = {
      version: '1.0',
      name: 'test-app',
      runtime: 'node:20',
      steps: [
        {
          name: 'Install dependencies',
          verb: 'install',
        },
        {
          name: 'Build application',
          verb: 'build',
          timeout: 600000,
        },
        {
          name: 'Run application',
          verb: 'run',
          env: { PORT: '3000' },
        },
      ],
      ports: [3000],
    };

    const result = validatePlan(validPlan);
    expect(result).toEqual(validPlan);
  });

  it('should reject invalid version', () => {
    const invalidPlan = {
      version: '2.0',
      name: 'test-app',
      runtime: 'node:20',
      steps: [],
    };

    expect(() => validatePlan(invalidPlan)).toThrow();
  });

  it('should reject invalid verb', () => {
    const invalidPlan = {
      version: '1.0',
      name: 'test-app',
      runtime: 'node:20',
      steps: [
        {
          name: 'Invalid step',
          verb: 'deploy', // Invalid verb
        },
      ],
    };

    expect(() => validatePlan(invalidPlan)).toThrow();
  });

  it('should accept optional fields', () => {
    const minimalPlan = {
      version: '1.0',
      name: 'minimal-app',
      runtime: 'node:20',
      steps: [
        {
          name: 'Install',
          verb: 'install',
        },
      ],
    };

    const result = validatePlan(minimalPlan);
    expect(result.name).toBe('minimal-app');
    expect(result.ports).toBeUndefined();
    expect(result.healthcheck).toBeUndefined();
  });

  it('should validate step with all optional fields', () => {
    const fullPlan = {
      version: '1.0',
      name: 'full-app',
      runtime: 'node:20',
      steps: [
        {
          name: 'Install with options',
          verb: 'install',
          args: ['--frozen-lockfile'],
          env: { NODE_ENV: 'production' },
          workdir: '/app',
          timeout: 300000,
        },
      ],
      ports: [3000, 8080],
      healthcheck: '/health',
    };

    const result = validatePlan(fullPlan);
    expect(result.steps[0].args).toEqual(['--frozen-lockfile']);
    expect(result.steps[0].env).toEqual({ NODE_ENV: 'production' });
    expect(result.steps[0].workdir).toBe('/app');
    expect(result.steps[0].timeout).toBe(300000);
  });
});
