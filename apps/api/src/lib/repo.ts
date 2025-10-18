export interface RepoContext {
  url: string;
  readme: string;
  manifests: Record<string, string>;
  structure: RepoStructure;
  analysis: RepoAnalysis;
}

export interface RepoStructure {
  hasDockerfile: boolean;
  hasProcfile: boolean;
  hasDevContainer: boolean;
  hasEnvExample: boolean;
  directories: string[];
  languages: string[];
}

export interface RepoAnalysis {
  primaryLanguage: string;
  runtime: string;
  buildCommand?: string;
  runCommand?: string;
  testCommand?: string;
  installCommand?: string;
  ports: number[];
  dependencies: Record<string, string>;
}

const MANIFEST_FILES = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'go.sum',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'Gemfile',
  'composer.json',
  'mix.exs',
];

const CONFIG_FILES = [
  'Dockerfile',
  'Procfile',
  '.devcontainer/devcontainer.json',
  '.env.example',
  'docker-compose.yml',
  'docker-compose.yaml',
];

const SOURCE_DIRS = [
  'src',
  'app',
  'lib',
  'server',
  'api',
  'backend',
  'frontend',
  'web',
  'public',
];

export async function fetchRepoContext(repoUrl: string): Promise<RepoContext> {
  // Parse GitHub URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)\/(.+))?/);
  if (!match) {
    throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo or https://github.com/owner/repo/tree/branch/path');
  }

  const [, owner, repo, branch = 'main', subpath = ''] = match;
  const basePath = subpath ? `${subpath}/` : '';
  const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}`;

  // Fetch README
  let readme = '';
  for (const readmeFile of ['README.md', 'README.txt', 'README']) {
    try {
      const response = await fetch(`${rawBaseUrl}${readmeFile}`);
      if (response.ok) {
        readme = await response.text();
        break;
      }
    } catch {
      // Try next README variant
    }
  }

  // Fetch manifests
  const manifests: Record<string, string> = {};
  await Promise.all(
    MANIFEST_FILES.map(async (file) => {
      try {
        const response = await fetch(`${rawBaseUrl}${file}`);
        if (response.ok) {
          manifests[file] = await response.text();
        }
      } catch {
        // Manifest doesn't exist, skip
      }
    })
  );

  // Fetch config files for structure analysis
  const configFiles: Record<string, boolean> = {};
  await Promise.all(
    CONFIG_FILES.map(async (file) => {
      try {
        const response = await fetch(`${rawBaseUrl}${file}`);
        configFiles[file] = response.ok;
      } catch {
        configFiles[file] = false;
      }
    })
  );

  if (!readme && Object.keys(manifests).length === 0) {
    throw new Error('Could not fetch any repository context. Ensure the repository is public and the URL is correct.');
  }

  // Analyze repository structure
  const structure: RepoStructure = {
    hasDockerfile: configFiles['Dockerfile'] || false,
    hasProcfile: configFiles['Procfile'] || false,
    hasDevContainer: configFiles['.devcontainer/devcontainer.json'] || false,
    hasEnvExample: configFiles['.env.example'] || false,
    directories: SOURCE_DIRS,
    languages: detectLanguages(manifests),
  };

  // Analyze repository for commands and runtime
  const analysis = analyzeRepository(manifests, readme);

  return {
    url: repoUrl,
    readme,
    manifests,
    structure,
    analysis,
  };
}

function detectLanguages(manifests: Record<string, string>): string[] {
  const languages: string[] = [];
  
  if (manifests['package.json']) languages.push('JavaScript/TypeScript');
  if (manifests['requirements.txt'] || manifests['pyproject.toml']) languages.push('Python');
  if (manifests['Cargo.toml']) languages.push('Rust');
  if (manifests['go.mod']) languages.push('Go');
  if (manifests['pom.xml'] || manifests['build.gradle']) languages.push('Java');
  if (manifests['Gemfile']) languages.push('Ruby');
  if (manifests['composer.json']) languages.push('PHP');
  if (manifests['mix.exs']) languages.push('Elixir');
  
  return languages;
}

function analyzeRepository(manifests: Record<string, string>, readme: string): RepoAnalysis {
  let primaryLanguage = 'unknown';
  let runtime = 'node:20'; // default
  let buildCommand: string | undefined;
  let runCommand: string | undefined;
  let testCommand: string | undefined;
  let installCommand: string | undefined;
  const ports: number[] = [];
  const dependencies: Record<string, string> = {};

  // Analyze package.json (Node.js)
  if (manifests['package.json']) {
    try {
      const pkg = JSON.parse(manifests['package.json']);
      primaryLanguage = 'JavaScript/TypeScript';
      runtime = 'node:20';
      
      // Extract commands from scripts
      if (pkg.scripts) {
        buildCommand = pkg.scripts.build ? 'npm run build' : undefined;
        runCommand = pkg.scripts.start ? 'npm start' : pkg.scripts.dev ? 'npm run dev' : undefined;
        testCommand = pkg.scripts.test ? 'npm test' : undefined;
      }
      
      installCommand = 'npm install';
      
      // Extract dependencies
      if (pkg.dependencies) {
        Object.assign(dependencies, pkg.dependencies);
      }
      
      // Detect ports from common patterns
      const pkgStr = JSON.stringify(pkg);
      const portMatches = pkgStr.match(/PORT["\s:=]+(\d+)/gi);
      if (portMatches) {
        portMatches.forEach(match => {
          const port = parseInt(match.match(/\d+/)?.[0] || '0');
          if (port > 0 && port < 65536 && !ports.includes(port)) {
            ports.push(port);
          }
        });
      }
      
      // Common default ports
      if (ports.length === 0) {
        if (pkg.dependencies?.['next'] || pkg.devDependencies?.['next']) {
          ports.push(3000);
        } else if (pkg.dependencies?.['express']) {
          ports.push(3000);
        } else if (pkg.dependencies?.['@remix-run/node']) {
          ports.push(3000);
        }
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  // Analyze requirements.txt or pyproject.toml (Python)
  if (manifests['requirements.txt'] || manifests['pyproject.toml']) {
    primaryLanguage = 'Python';
    runtime = 'python:3.11';
    installCommand = 'pip install -r requirements.txt';
    
    // Common Python frameworks
    const reqText = manifests['requirements.txt'] || manifests['pyproject.toml'] || '';
    if (reqText.includes('flask')) {
      runCommand = 'python app.py';
      ports.push(5000);
    } else if (reqText.includes('django')) {
      runCommand = 'python manage.py runserver';
      ports.push(8000);
    } else if (reqText.includes('fastapi')) {
      runCommand = 'uvicorn main:app';
      ports.push(8000);
    }
    
    testCommand = 'pytest';
  }

  // Analyze Cargo.toml (Rust)
  if (manifests['Cargo.toml']) {
    primaryLanguage = 'Rust';
    runtime = 'rust:1.75';
    installCommand = 'cargo fetch';
    buildCommand = 'cargo build --release';
    runCommand = 'cargo run --release';
    testCommand = 'cargo test';
    
    // Rust web frameworks often use 8080
    if (manifests['Cargo.toml'].includes('actix-web') || manifests['Cargo.toml'].includes('rocket')) {
      ports.push(8080);
    }
  }

  // Analyze go.mod (Go)
  if (manifests['go.mod']) {
    primaryLanguage = 'Go';
    runtime = 'golang:1.21';
    installCommand = 'go mod download';
    buildCommand = 'go build';
    runCommand = 'go run .';
    testCommand = 'go test ./...';
    
    // Go web servers often use 8080
    ports.push(8080);
  }

  // Analyze README for additional port information
  const readmeLower = readme.toLowerCase();
  const readmePortMatches = readmeLower.match(/port[:\s]+(\d+)/gi);
  if (readmePortMatches) {
    readmePortMatches.forEach(match => {
      const port = parseInt(match.match(/\d+/)?.[0] || '0');
      if (port > 0 && port < 65536 && !ports.includes(port)) {
        ports.push(port);
      }
    });
  }

  return {
    primaryLanguage,
    runtime,
    buildCommand,
    runCommand,
    testCommand,
    installCommand,
    ports: ports.length > 0 ? ports : [3000], // default to 3000 if none found
    dependencies,
  };
}
