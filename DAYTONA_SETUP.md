# 🚀 Daytona Setup for SafeRun

## Quick Start (Development Mode)

For local development and testing, we provide a **mock Daytona server** that simulates the Daytona API:

### Option 1: Run Everything Together
```bash
pnpm dev:full
```

This starts:
- Mock Daytona Server on http://localhost:3986
- SafeRun API on http://localhost:3000
- SafeRun Web on http://localhost:3001

### Option 2: Run Separately
```bash
# Terminal 1: Start mock Daytona server
pnpm daytona:mock

# Terminal 2: Start SafeRun
pnpm dev
```

---

## ⚠️ Important Notes

### Mock Server Limitations

The mock Daytona server (`mock-daytona-server.js`):
- ✅ **Good for**: Testing the UI, security analysis, plan generation
- ✅ **Good for**: Demonstrating the workflow
- ⚠️ **WARNING**: Executes commands on YOUR LOCAL MACHINE (not isolated!)
- ❌ **NOT for**: Production use or executing untrusted code
- ❌ **NOT for**: Real isolation (no containers)

### What the Mock Server Does

```javascript
// Creates "workspaces" (just IDs, no real containers)
POST /workspace → { id: "ws-1", name: "...", status: "running" }

// Executes commands LOCALLY (no isolation!)
POST /workspace/ws-1/exec → Runs command on your machine

// Returns mock preview URLs
POST /workspace/ws-1/expose → { url: "http://localhost:3000", port: 3000 }

// Cleans up (just removes from memory)
DELETE /workspace/ws-1 → Deletes workspace ID
```

---

## 🔒 Production Setup Options

For real isolated execution, you have these options:

### Option 1: Daytona Cloud (Recommended for Hackathon)

1. Sign up at https://daytona.io
2. Get your API credentials
3. Update `.env`:
```env
DAYTONA_BASE_URL=https://api.daytona.io
# May need additional auth headers in daytona.ts
```

### Option 2: Self-Hosted Daytona (Advanced)

If Daytona offers a self-hosted option:
```bash
# Follow Daytona's official installation guide
# Then update .env with your instance URL
DAYTONA_BASE_URL=http://your-daytona-server:3986
```

### Option 3: Docker Alternative (Custom Implementation)

Replace Daytona with Docker API:
- Modify `apps/api/src/lib/daytona.ts` to use Docker SDK
- Use `dockerode` npm package
- Create containers instead of Daytona workspaces

---

## 🧪 Testing the Mock Server

### 1. Start the mock server:
```bash
pnpm daytona:mock
```

### 2. Test with curl:
```bash
# Health check
curl http://localhost:3986/health

# Create workspace
curl -X POST http://localhost:3986/workspace \
  -H "Content-Type: application/json" \
  -d '{"name":"test","image":"node:20","resources":{"memory":"2048M"},"user":"nonroot"}'

# Execute command
curl -X POST http://localhost:3986/workspace/ws-1/exec \
  -H "Content-Type: application/json" \
  -d '{"command":["echo","hello"],"workdir":"/tmp"}'

# Expose port
curl -X POST http://localhost:3986/workspace/ws-1/expose \
  -H "Content-Type: application/json" \
  -d '{"port":3000}'

# Delete workspace
curl -X DELETE http://localhost:3986/workspace/ws-1
```

---

## 📝 Environment Variables

Your `.env` should look like this for local development:

```env
# Anthropic API Key (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Daytona Mock Server (for development)
DAYTONA_BASE_URL=http://localhost:3986

# Server configuration
PORT=3000
NODE_ENV=development

# Security settings
WORKSPACE_TIMEOUT_MS=1800000
MAX_MEMORY_MB=2048
ALLOWED_EGRESS_DOMAINS=github.com,npmjs.com,registry.npmjs.org
```

---

## 🎯 Recommended Workflow

### For Hackathon Demo:
1. Use the **mock server** for quick testing
2. Only execute **trusted repositories** (your own code)
3. Demonstrate the security analysis features
4. Show the plan generation capabilities

### For Production:
1. Integrate with **Daytona Cloud** or self-hosted instance
2. Implement proper authentication
3. Add rate limiting
4. Enable full isolation

---

## 🐛 Troubleshooting

### Mock server won't start:
```bash
# Check if port 3986 is already in use
lsof -i :3986

# Kill the process if needed
kill -9 <PID>
```

### Commands fail in mock server:
- The mock server runs commands on your local machine
- Make sure the command exists (e.g., `git`, `node`, `npm`)
- Check file paths are correct

### SafeRun can't connect to mock server:
```bash
# Verify mock server is running
curl http://localhost:3986/health

# Check .env has correct URL
cat .env | grep DAYTONA_BASE_URL
```

---

## 📚 Next Steps

1. **For Demo**: Use mock server, it's perfect for showcasing features
2. **For Real Use**: Integrate with Daytona Cloud or implement Docker alternative
3. **For Security**: Never execute untrusted code with the mock server

Happy hacking! 🚀
