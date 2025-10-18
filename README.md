# Initium MVP

**Secure code execution platform with SafeRun security layer, Daytona isolation, and Anthropic Claude AI**

Initium is a TypeScript-based platform that analyzes GitHub repositories, scans for security threats, generates deterministic execution plans using AI, and executes them securely in isolated Daytona workspaces.

## Features

- 🛡️ **SafeRun Security Layer**: 3-layer protection with PromptShield (30+ rules) + Claude AI analysis
- 🚫 **Risk-Based Blocking**: Automatically blocks High/Critical risk executions
- 🤖 **AI-Powered Analysis**: Uses Claude to analyze repositories and assess security risks
- 🔒 **Security First**: Non-root containers, network egress allowlists, memory caps, and timeouts
- 📊 **Real-time Streaming**: SSE-based log streaming with live execution updates
- 🎯 **Deterministic Execution**: No raw shell commands - only verified verbs (install, build, run, test)
- 🌐 **Web UI**: Modern Next.js interface for pasting repos and watching logs
- 🔗 **Preview URLs**: Automatic port exposure for web applications
- 📝 **Comprehensive Audit Logs**: Full security trail for all executions

## Architecture

```
apps/
├── api/                    # Fastify backend
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── config.ts       # Configuration management
│       ├── routes/
│       │   ├── plan.ts     # POST /api/plan - Generate execution plan
│       │   ├── execute.ts  # POST /api/execute - Execute plan
│       │   └── run.ts      # GET /api/run/:id - Stream logs via SSE
│       └── lib/
│           ├── rules.ts     # PromptShield security scanner (30+ rules)
│           ├── llmSecurity.ts # Claude AI security analysis
│           ├── daytona.ts  # Daytona HTTP client wrapper
│           ├── planSchema.ts # Zod schema + security validation
│           ├── executor.ts # Deterministic step execution
│           ├── repo.ts     # GitHub repository fetcher
│           └── llm.ts      # Anthropic Claude integration
└── web/                    # Next.js frontend
    └── src/
        └── app/
            └── page.tsx    # Main UI with form + log stream
```

## API Endpoints

### POST /api/plan
Generate an execution plan from a GitHub repository URL.

**Request:**
```json
{
  "repoUrl": "https://github.com/remix-run/examples/tree/main/basic"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "version": "1.0",
    "name": "remix-basic",
    "runtime": "node:20",
    "steps": [
      { "name": "Install dependencies", "verb": "install" },
      { "name": "Build application", "verb": "build" },
      { "name": "Run application", "verb": "run" }
    ],
    "ports": [3000]
  },
  "yaml": "version: '1.0'\nname: remix-basic\n..."
}
```

### POST /api/execute
Execute a plan in a Daytona workspace.

**Request:**
```json
{
  "repoUrl": "https://github.com/remix-run/examples/tree/main/basic",
  "plan": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "runId": "abc123",
  "message": "Execution started"
}
```

### GET /api/run/:id
Stream execution logs via Server-Sent Events (SSE).

**Response (SSE stream):**
```
data: {"timestamp":"2024-01-01T00:00:00Z","level":"info","message":"Starting step: Install dependencies","step":"Install dependencies"}

data: {"timestamp":"2024-01-01T00:00:05Z","level":"success","message":"Step completed: Install dependencies"}

data: {"type":"complete","status":"success","previewUrl":"https://workspace-abc123.daytona.io"}
```

## Plan Schema

Plans are defined in YAML and validated with Zod:

```yaml
version: "1.0"
name: my-app
runtime: node:20  # Docker image
steps:
  - name: Install dependencies
    verb: install
    args: ["--frozen-lockfile"]  # Optional
    env:                          # Optional
      NODE_ENV: production
    workdir: /workspace/repo      # Optional
    timeout: 300000               # Optional (ms)
  - name: Build application
    verb: build
  - name: Run application
    verb: run
ports: [3000]                     # Optional
healthcheck: /health              # Optional
```

### Supported Verbs

| Verb | Node.js | Python | Rust | Go |
|------|---------|--------|------|-----|
| `install` | `pnpm install` | `pip install -r requirements.txt` | `cargo fetch` | `go mod download` |
| `build` | `npm run build` | ❌ | `cargo build --release` | `go build` |
| `run` | `npm start` | `python main.py` | `cargo run --release` | `go run .` |
| `test` | `npm test` | `pytest` | `cargo test` | `go test ./...` |

## Security Features

1. **Non-root execution**: All containers run as `nonroot` user
2. **Network egress allowlist**: Only approved domains (GitHub, npm, etc.)
3. **Memory limits**: Configurable max memory per workspace (default: 2GB)
4. **Timeouts**: Per-step and global workspace timeouts
5. **Auto-cleanup**: Workspaces destroyed after 30 minutes or on completion
6. **No raw shell**: Only predefined verbs allowed - no arbitrary commands

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Daytona instance running (set `DAYTONA_BASE_URL`)
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd Dayton_Hack
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

Required environment variables:
```env
ANTHROPIC_API_KEY=sk-ant-...
DAYTONA_BASE_URL=http://localhost:3986
PORT=3000
WORKSPACE_TIMEOUT_MS=1800000
MAX_MEMORY_MB=2048
ALLOWED_EGRESS_DOMAINS=github.com,npmjs.com,registry.npmjs.org
```

### Development

Start both API and web servers:
```bash
pnpm dev
```

This will start:
- API server on http://localhost:3000
- Web UI on http://localhost:3001

### Testing

Run unit tests:
```bash
pnpm test
```

### Production Build

```bash
pnpm build
pnpm start
```

## Usage Example

1. Open http://localhost:3001
2. Paste a GitHub repository URL (e.g., `https://github.com/remix-run/examples/tree/main/basic`)
3. Click "Generate Plan" - Claude analyzes the repo and creates an execution plan
4. Review the generated YAML plan
5. Click "Execute Plan" - Initium creates a Daytona workspace and runs the steps
6. Watch logs stream in real-time
7. If the app exposes a port, you'll get a preview URL

## Acceptance Criteria ✅

- [x] Paste GitHub repo URL → plan generated
- [x] Execute plan → logs stream in real-time
- [x] Preview URL displayed if port is bound
- [x] Clear error messages if install/build fails
- [x] Unit tests for plan schema validation
- [x] Unit tests for executor verb mapper
- [x] No raw shell commands in executor
- [x] Timeouts and memory caps enforced
- [x] Non-root user in containers
- [x] Network egress allowlist
- [x] Auto-destroy workspace on completion or timeout

## Technology Stack

- **Backend**: Fastify, TypeScript, Zod
- **Frontend**: Next.js 14, React, TailwindCSS
- **AI**: Anthropic Claude 3.5 Sonnet
- **Infrastructure**: Daytona workspaces
- **Testing**: Vitest
- **Package Manager**: pnpm

## Project Structure

```
.
├── apps/
│   ├── api/                # Backend API
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   ├── routes/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                # Frontend UI
│       ├── src/
│       │   └── app/
│       ├── package.json
│       └── tsconfig.json
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace config
├── tsconfig.json           # Shared TypeScript config
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ for secure code execution
