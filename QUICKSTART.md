# Initium Quick Start Guide

Get up and running with Initium in 5 minutes.

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - Install with `npm install -g pnpm`
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
- **Daytona Instance** - Running and accessible

## Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repo-url>
cd Dayton_Hack

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Or manually:

```bash
# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
```

### 2. Configure Environment

Edit `.env` and add your credentials:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
DAYTONA_BASE_URL=http://localhost:3986
```

### 3. Start Development Servers

```bash
pnpm dev
```

This starts:
- **API Server**: http://localhost:3000
- **Web UI**: http://localhost:3001

## First Execution

### Using the Web UI

1. Open http://localhost:3001
2. Paste this example URL:
   ```
   https://github.com/remix-run/examples/tree/main/basic
   ```
3. Click **"Generate Plan"**
4. Review the generated YAML plan
5. Click **"Execute Plan"**
6. Watch logs stream in real-time
7. Get preview URL when ready

### Using the API

#### Generate a Plan

```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/remix-run/examples/tree/main/basic"
  }'
```

#### Execute a Plan

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/remix-run/examples/tree/main/basic",
    "planYaml": "version: \"1.0\"\nname: remix-basic\n..."
  }'
```

#### Stream Logs

```bash
curl -N http://localhost:3000/api/run/<run-id>
```

## Testing

Run unit tests:

```bash
pnpm test
```

Test the API:

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

## Example Repositories

Try these repositories:

### Node.js / React
```
https://github.com/remix-run/examples/tree/main/basic
```

### Python / Flask
```
https://github.com/pallets/flask/tree/main/examples/tutorial
```

### Simple Static Site
```
https://github.com/vercel/next.js/tree/canary/examples/hello-world
```

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"

Make sure you've added your API key to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### "Failed to create workspace"

Check that Daytona is running:
```bash
curl http://localhost:3986/health
```

Update `DAYTONA_BASE_URL` in `.env` if needed.

### "Failed to fetch repository context"

Ensure the GitHub URL is:
- Public repository
- Valid format: `https://github.com/owner/repo` or `https://github.com/owner/repo/tree/branch/path`

### Port Already in Use

Change ports in `.env`:
```env
PORT=3000  # API port
```

And in `apps/web/package.json`:
```json
"dev": "next dev -p 3001"  # Change 3001 to another port
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check [examples/](./examples/) for sample plans
- See [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Common Commands

```bash
# Development
pnpm dev              # Start both API and web
pnpm --filter api dev # Start only API
pnpm --filter web dev # Start only web

# Testing
pnpm test            # Run all tests
pnpm --filter api test # Run API tests only

# Production
pnpm build           # Build both apps
pnpm start           # Start production servers

# Cleanup
rm -rf node_modules apps/*/node_modules
pnpm install         # Fresh install
```

## Support

- **Issues**: Open a GitHub issue
- **Docs**: See [README.md](./README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

Happy coding! 🚀
