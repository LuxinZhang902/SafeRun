# 🚀 START HERE - Initium MVP

**Welcome to Initium!** This is your starting point.

---

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Install Dependencies

```bash
pnpm install
```

### 2️⃣ Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
DAYTONA_BASE_URL=http://localhost:3986
```

### 3️⃣ Start Development Servers

**Option A: Start Everything (Recommended)**

```bash
pnpm dev:full
```

This starts:

- **Mock Daytona Server**: http://localhost:3986
- **API**: http://localhost:3000
- **Web**: http://localhost:3001

**Option B: Start Separately**

```bash
# Terminal 1: Mock Daytona Server
pnpm daytona:mock

# Terminal 2: SafeRun API & Web
pnpm dev
```

> ⚠️ **Note**: We use a mock Daytona server for local development. See [DAYTONA_SETUP.md](./DAYTONA_SETUP.md) for details.

### 4️⃣ Try It Out

1. Open http://localhost:3001
2. Paste: `https://github.com/remix-run/examples/tree/main/basic`
3. Click "Generate Plan" → See security analysis + risk score
4. Click "Execute Plan" (only if Low/Medium risk)
5. Watch the magic happen! ✨

### 5️⃣ Test SafeRun Security (Optional)

```bash
./test-saferun.sh
```

This tests the security layer with various threat scenarios.

---

## 📚 What to Read Next

### For First-Time Users

→ [QUICKSTART.md](./QUICKSTART.md) - Detailed setup guide  
→ [DEMO.md](./DEMO.md) - Demo walkthrough

### For Developers

→ [ARCHITECTURE.md](./ARCHITECTURE.md) - System design  
→ [API.md](./API.md) - API documentation  
→ [SAFERUN_SECURITY.md](./SAFERUN_SECURITY.md) - Security layer details  
→ [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide

### For DevOps

→ [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment  
→ [VERIFICATION.md](./VERIFICATION.md) - Testing checklist  
→ [SAFERUN_IMPLEMENTATION.md](./SAFERUN_IMPLEMENTATION.md) - Security implementation

### Need Help?

→ [INDEX.md](./INDEX.md) - Complete documentation index  
→ [QUICKSTART.md#troubleshooting](./QUICKSTART.md#troubleshooting) - Common issues

---

## 🎯 What is Initium?

Initium is a **secure code execution platform** that:

1. **Analyzes** GitHub repositories using AI (Claude) with deep traversal
2. **Scans** for security threats with SafeRun (30+ detection rules)
3. **Generates** deterministic execution plans (YAML)
4. **Blocks** High/Critical risk executions automatically
5. **Executes** code in isolated Daytona workspaces
6. **Streams** logs in real-time
7. **Provides** preview URLs for web apps

**All with security built-in**: PromptShield scanning, risk-based blocking, no raw shell commands, resource limits, automatic cleanup.

### 🆕 Enhanced Features

- **SafeRun Security Layer** - 3-layer protection with PromptShield + Claude AI
- **Deep Repository Analysis** - Detects languages, runtimes, commands, ports automatically
- **Risk-Based Execution** - Blocks High/Critical threats, allows Low/Medium
- **Token-Efficient** - Smart truncation of large files for AI analysis
- **Multi-Language Support** - Node.js, Python, Rust, Go, Java, Ruby, PHP, Elixir

---

## 🛠️ Common Commands

```bash
# Development
pnpm dev              # Start both API and web
pnpm --filter api dev # Start only API
pnpm --filter web dev # Start only web

# Testing
pnpm test            # Run all tests
./scripts/test-api.sh # Test API endpoints

# Building
pnpm build           # Build for production
pnpm start           # Start production servers

# Utilities
make help            # Show all available commands
make setup           # Run setup script
make check           # Run all checks
```

---

## 📁 Project Structure

```
Dayton_Hack/
├── apps/
│   ├── api/         # Backend (Fastify + TypeScript)
│   └── web/         # Frontend (Next.js + React)
├── examples/        # Example YAML plans
├── scripts/         # Utility scripts
└── [docs]/          # 13 documentation files
```

---

## ✅ Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - Install: `npm install -g pnpm`
- **Anthropic API Key** - [Get one](https://console.anthropic.com/)
- **Daytona Instance** - Running and accessible

---

## 🎬 Demo in 60 Seconds

```bash
# Terminal 1: Start servers
pnpm dev

# Terminal 2: Test API
curl http://localhost:3000/health

# Browser: Open UI
open http://localhost:3001

# Paste this URL:
https://github.com/remix-run/examples/tree/main/basic

# Click "Generate Plan" → "Execute Plan" → Watch logs!
```

---

## 🔐 Security Features

- ✅ No raw shell commands (only 4 verbs: install, build, run, test)
- ✅ Non-root container execution
- ✅ Memory limits (2GB default)
- ✅ Network egress allowlist
- ✅ Automatic workspace cleanup
- ✅ Timeout protection (30 min max)

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Expected output:
# ✓ 11 plan schema tests
# ✓ 20+ executor verb mapper tests
# All tests passing!
```

---

## 📊 What's Included

### Code

- ✅ Complete TypeScript backend (Fastify)
- ✅ Modern React frontend (Next.js)
- ✅ 31+ unit tests
- ✅ 6 core libraries
- ✅ 3 API endpoints

### Documentation

- ✅ 13 markdown files (3,850+ lines)
- ✅ Complete API reference
- ✅ Architecture deep dive
- ✅ Deployment guide
- ✅ Demo script

### Examples

- ✅ Node.js/Remix plan
- ✅ Python/Flask plan
- ✅ Setup scripts
- ✅ Test scripts

---

## 🎯 Next Steps

1. ✅ **You are here** - Read this file
2. 📖 Read [README.md](./README.md) for overview
3. ⚡ Follow [QUICKSTART.md](./QUICKSTART.md) for setup
4. 🧪 Run tests: `pnpm test`
5. 🚀 Try a demo execution
6. 📚 Explore [INDEX.md](./INDEX.md) for all docs

---

## 💡 Tips

- **Stuck?** Check [QUICKSTART.md#troubleshooting](./QUICKSTART.md#troubleshooting)
- **Want to contribute?** Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Need API details?** See [API.md](./API.md)
- **Deploying?** Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Lost?** Use [INDEX.md](./INDEX.md) to navigate

---

## 🆘 Troubleshooting

### "ANTHROPIC_API_KEY is not set"

→ Add your API key to `.env`

### "Failed to create workspace"

→ Check Daytona is running: `curl $DAYTONA_BASE_URL/health`

### "Port already in use"

→ Change ports in `.env` and `apps/web/package.json`

### Still stuck?

→ See [QUICKSTART.md#troubleshooting](./QUICKSTART.md#troubleshooting)

---

## 📞 Get Help

- **Documentation**: [INDEX.md](./INDEX.md) - Complete index
- **Issues**: GitHub Issues - Report bugs
- **Questions**: GitHub Discussions - Ask questions
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md) - Guidelines

---

## 🎉 Success Criteria

You're ready when you can:

- [x] Start the servers (`pnpm dev`)
- [x] Open the web UI (http://localhost:3001)
- [x] Generate a plan from a GitHub URL
- [x] Execute the plan
- [x] See logs streaming
- [x] Get a preview URL (if applicable)

---

## 📈 What's Next?

After getting started:

1. **Explore**: Try different repositories
2. **Learn**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Customize**: Edit example plans
4. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Contribute**: Check [TODO.md](./TODO.md) for ideas

---

## 🌟 Key Features

- 🤖 **AI-Powered** - Claude analyzes repos automatically
- 🔒 **Secure** - Multiple isolation layers
- ⚡ **Fast** - Real-time log streaming
- 🎯 **Simple** - 3 API endpoints, clean UI
- 📦 **Complete** - Full docs, tests, examples

---

## 📦 Deliverables Checklist

- ✅ Backend API (Fastify + TypeScript)
- ✅ Frontend UI (Next.js + React)
- ✅ Daytona integration
- ✅ Anthropic Claude integration
- ✅ Real-time log streaming
- ✅ Security features
- ✅ Unit tests (31+)
- ✅ Documentation (13 files)
- ✅ Examples (2 plans)
- ✅ Scripts (setup, test)

**Status**: ✅ **COMPLETE & READY**

---

## 🚀 Ready to Start?

```bash
# Let's go!
pnpm install
cp .env.example .env
# Add your API keys to .env
pnpm dev
# Open http://localhost:3001
```

**Happy coding!** 🎉

---

**Need more details?** → [README.md](./README.md)  
**Want quick setup?** → [QUICKSTART.md](./QUICKSTART.md)  
**Lost in docs?** → [INDEX.md](./INDEX.md)
