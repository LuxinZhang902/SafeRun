# Initium Demo Script

This script guides you through a complete demo of Initium MVP.

## Pre-Demo Setup (5 minutes)

### 1. Start Services
```bash
# Terminal 1: Start API
cd /path/to/Dayton_Hack
pnpm --filter api dev

# Terminal 2: Start Web UI
pnpm --filter web dev
```

### 2. Verify Services
```bash
# Check API health
curl http://localhost:3000/health

# Open Web UI
open http://localhost:3001
```

### 3. Prepare Demo Repositories

Have these URLs ready:
- **Node.js/Remix**: `https://github.com/remix-run/examples/tree/main/basic`
- **Python/Flask**: `https://github.com/pallets/flask/tree/main/examples/tutorial`
- **Simple Next.js**: `https://github.com/vercel/next.js/tree/canary/examples/hello-world`

## Demo Flow (10 minutes)

### Part 1: Introduction (1 minute)

**Script**:
> "Initium is a secure code execution platform that uses AI to analyze GitHub repositories and execute them in isolated environments. Let me show you how it works."

**Show**:
- Web UI at http://localhost:3001
- Clean, modern interface
- Simple input field

### Part 2: Plan Generation (3 minutes)

**Script**:
> "First, we paste a GitHub repository URL. Initium will use Claude AI to analyze the repository structure, detect the runtime, and generate a deterministic execution plan."

**Steps**:
1. Paste: `https://github.com/remix-run/examples/tree/main/basic`
2. Click "Generate Plan"
3. Wait for Claude to analyze (~5 seconds)

**Show**:
- Loading state
- Generated YAML plan appears
- Explain plan structure:
  - Runtime detection (node:20)
  - Install step
  - Build step
  - Run step
  - Port exposure (3000)

**Key Points**:
- AI-powered analysis
- No manual configuration needed
- Deterministic YAML output
- Only 4 allowed verbs (install, build, run, test)

### Part 3: Execution (4 minutes)

**Script**:
> "Now we'll execute this plan in an isolated Daytona workspace. Watch as the logs stream in real-time."

**Steps**:
1. Click "Execute Plan"
2. Watch logs stream

**Show**:
- Workspace creation
- Repository cloning
- Dependency installation
- Build process
- Application startup
- Port exposure
- Preview URL

**Key Points**:
- Real-time log streaming (SSE)
- Color-coded log levels (info, success, error)
- Isolated execution environment
- Automatic port exposure
- Preview URL provided

### Part 4: Security Features (2 minutes)

**Script**:
> "Security is built into every layer of Initium."

**Show** (switch to code/docs):
1. **No Raw Shell Commands**
   - Show `executor.ts` verb mapper
   - Only 4 verbs allowed
   - Deterministic command mapping

2. **Resource Limits**
   - Show `.env` configuration
   - Memory caps (2GB default)
   - Timeouts (30 min global)

3. **Isolation**
   - Non-root user
   - Network egress allowlist
   - Auto-cleanup after execution

**Key Points**:
- Defense in depth
- No arbitrary command execution
- Automatic resource management
- Complete isolation

## Alternative Demo Paths

### Path A: Quick Demo (5 minutes)
- Skip plan generation explanation
- Focus on execution and logs
- Show preview URL
- Highlight security briefly

### Path B: Technical Deep Dive (15 minutes)
- Show API endpoints with curl
- Demonstrate SSE streaming
- Walk through code architecture
- Explain verb mapping logic
- Show test suite

### Path C: Security Focus (10 minutes)
- Attempt to execute malicious plan
- Show validation errors
- Explain security boundaries
- Demonstrate resource limits
- Show auto-cleanup

## Demo Scenarios

### Scenario 1: Successful Execution
**Repository**: Remix Basic Example
**Expected**: Clean execution, preview URL
**Duration**: ~2 minutes

### Scenario 2: Build Failure
**Repository**: Intentionally broken repo
**Expected**: Clear error messages in logs
**Duration**: ~1 minute

### Scenario 3: Multiple Runtimes
**Show**: Node.js, Python, Rust, Go support
**Expected**: Different verb mappings
**Duration**: ~3 minutes

## Talking Points

### Value Proposition
- **For Developers**: "Test any GitHub repo instantly, no local setup"
- **For Teams**: "Secure code review with isolated execution"
- **For CI/CD**: "AI-powered build configuration"

### Technical Highlights
- TypeScript throughout
- Modern tech stack (Fastify, Next.js, Claude)
- Comprehensive test coverage
- Production-ready security

### Differentiators
- AI-powered plan generation (no manual config)
- Deterministic execution (no shell scripts)
- Real-time streaming (instant feedback)
- Security-first design (isolated, limited, monitored)

## Q&A Preparation

### Common Questions

**Q: How does it handle private repositories?**
A: Currently supports public repos only. Private repo support would require GitHub OAuth integration.

**Q: What about dependencies that require secrets?**
A: Future enhancement: secure secrets management with environment variable injection.

**Q: Can it handle monorepos?**
A: Yes! Supports paths like `github.com/owner/repo/tree/branch/path`

**Q: How much does it cost to run?**
A: Main costs: Anthropic API (~$0.01 per plan), Daytona workspace compute (varies)

**Q: What about scaling?**
A: Current MVP is single-instance. Production would use Redis for state, queue for executions.

**Q: Security concerns?**
A: Multiple layers: no raw shell, resource limits, network allowlist, non-root user, auto-cleanup.

**Q: Browser Use integration?**
A: Architecture supports it, not yet implemented. Would enable visual testing and screenshots.

**Q: Can I customize the plan?**
A: Yes! Edit the YAML before execution. Future: plan editor UI.

## Demo Troubleshooting

### Issue: Plan generation fails
**Solution**: Check Anthropic API key, verify network connectivity

### Issue: Execution fails immediately
**Solution**: Check Daytona is running, verify DAYTONA_BASE_URL

### Issue: Logs don't stream
**Solution**: Check browser console, verify SSE connection

### Issue: Preview URL doesn't work
**Solution**: Port may not be exposed, check Daytona configuration

## Post-Demo

### Show Documentation
- README.md - Overview
- QUICKSTART.md - 5-minute setup
- ARCHITECTURE.md - Technical details
- API.md - Complete API reference

### Show Code Quality
- TypeScript throughout
- Comprehensive tests
- Clean architecture
- Security best practices

### Next Steps
- Try it yourself: `pnpm dev`
- Read the docs
- Contribute on GitHub
- Deploy to production

## Demo Checklist

Before demo:
- [ ] Services running
- [ ] API responding
- [ ] Web UI loading
- [ ] Demo repos accessible
- [ ] Network stable
- [ ] Screen sharing ready

During demo:
- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Zoom in on code
- [ ] Speak clearly
- [ ] Pause for questions

After demo:
- [ ] Share repository link
- [ ] Share documentation
- [ ] Answer questions
- [ ] Collect feedback

## Success Metrics

Demo is successful if audience understands:
- ✅ What Initium does
- ✅ How it works (high level)
- ✅ Why it's secure
- ✅ How to use it

---

**Good luck with your demo! 🚀**
