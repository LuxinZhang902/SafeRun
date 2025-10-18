import { type Plan } from './planSchema';

/**
 * Simple plan generator - NO AI required
 * Detects package manager and creates basic execution plan
 */
export function generateSimplePlan(
  repoUrl: string,
  manifests: Record<string, string>
): Plan {
  const repoName = repoUrl.split('/').pop()?.replace(/\.git$/, '') || 'app';

  // Detect package manager and runtime
  let runtime = 'node:20';
  const steps: Plan['steps'] = [];
  const ports: number[] = [];

  // Check for Node.js project
  if (manifests['package.json']) {
    try {
      const pkg = JSON.parse(manifests['package.json']);

      // Detect package manager
      let installVerb: 'install' = 'install';
      let installArgs: string[] = ['install'];

      if (manifests['pnpm-lock.yaml'] || pkg.packageManager?.includes('pnpm')) {
        // pnpm detected
        installArgs = ['install'];
      } else if (manifests['yarn.lock']) {
        // yarn detected
        installArgs = ['install'];
      } else {
        // npm (default)
        installArgs = ['install'];
      }

      // Add install step
      steps.push({
        name: 'Install dependencies',
        verb: installVerb,
        args: installArgs,
      });

      // Add build step if build script exists
      if (pkg.scripts?.build) {
        steps.push({
          name: 'Build application',
          verb: 'build',
          args: ['run', 'build'],
        });
      }

      // Add run step if start or dev script exists
      if (pkg.scripts?.start) {
        steps.push({
          name: 'Start application',
          verb: 'run',
          args: ['start'],
        });
        ports.push(3000); // Assume port 3000 for web apps
      } else if (pkg.scripts?.dev) {
        steps.push({
          name: 'Start development server',
          verb: 'run',
          args: ['run', 'dev'],
        });
        ports.push(3000);
      }
    } catch (e) {
      // Invalid package.json, add basic install step
      steps.push({
        name: 'Install dependencies',
        verb: 'install',
        args: ['install'],
      });
    }
  }

  // Check for Python project
  else if (manifests['requirements.txt'] || manifests['pyproject.toml']) {
    runtime = 'python:3.11';

    if (manifests['requirements.txt']) {
      steps.push({
        name: 'Install Python dependencies',
        verb: 'install',
        args: ['install', '-r', 'requirements.txt'],
      });
    }

    // Add run step if common Python files exist
    if (manifests['app.py'] || manifests['main.py']) {
      const mainFile = manifests['app.py'] ? 'app.py' : 'main.py';
      steps.push({
        name: 'Run Python application',
        verb: 'run',
        args: [mainFile],
      });
      ports.push(5000); // Common Python web app port
    }
  }

  // Fallback: if no steps detected, add basic install
  if (steps.length === 0) {
    steps.push({
      name: 'Install dependencies',
      verb: 'install',
      args: ['install'],
    });
  }

  return {
    version: '1.0',
    name: repoName,
    runtime,
    steps,
    ports,
  };
}
