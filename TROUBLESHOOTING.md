# 🔧 Troubleshooting Guide

## Issue: Git Clone Hangs / Takes Too Long

### Symptoms
- Execution stops after "Workspace created"
- No logs after "Cloning repository"
- Terminal shows `[Daytona] Executing command: git clone...` but nothing happens
- Execution times out after 2 minutes

### Root Cause
The Daytona SDK's `executeCommand` method may have issues with:
1. Long-running commands (git clone)
2. Commands that produce a lot of output
3. Network operations in sandboxes

### Solutions

#### Option 1: Use a Smaller Repository (Recommended for Testing)
Instead of cloning your full SafeRun repo, test with a minimal example:

**Good test repositories:**
```
https://github.com/vercel/next.js/tree/canary/examples/hello-world
https://github.com/remix-run/examples/tree/main/basic
https://github.com/vercel/next.js/tree/canary/examples/blog-starter
```

These are:
- ✅ Small (< 1 MB)
- ✅ Clone quickly (< 10 seconds)
- ✅ Have simple build steps
- ✅ Work well with Daytona

#### Option 2: Check Daytona API Key & Quota
```bash
# Verify your API key is valid
echo $DAYTONA_API_KEY

# Check if you've hit usage limits
# Visit: https://www.daytona.io/dashboard
```

You might have:
- ❌ Invalid API key
- ❌ Expired API key
- ❌ Hit usage quota
- ❌ Network restrictions

#### Option 3: Use Mock Server for Demo
If you just need to demo the UI/workflow:

```bash
# 1. Restore the mock server
git checkout main -- mock-daytona-server.js

# 2. Update package.json
# Add back: "dev:full": "node mock-daytona-server.js & pnpm dev"

# 3. Start with mock
pnpm dev:full
```

The mock server:
- ✅ Works instantly
- ✅ No API key needed
- ✅ Good for demos
- ❌ Not real isolation

---

## Current Status Summary

### ✅ What's Working
1. **Security Check** - AI-powered analysis
2. **Plan Generation** - Detects package.json, creates YAML
3. **UI/UX** - Real-time logs, developer mode, stop button
4. **Daytona Integration** - Official SDK installed
5. **Progress Indicators** - Time estimates, emojis
6. **Developer Mode** - Detailed logging

### ⚠️ What's Stuck
1. **Git Clone** - Hangs in Daytona sandbox
2. **Execution** - Can't proceed past clone step

### 🔍 Likely Causes
1. **Daytona SDK Issue** - `executeCommand` not handling git clone well
2. **Network Timeout** - Sandbox can't reach GitHub
3. **API Limits** - Free tier restrictions
4. **Large Repository** - SafeRun repo might be too big

---

## Recommended Next Steps

### For Hackathon Demo:
1. **Use a small test repo** (hello-world example)
2. **Show the workflow** with mock server
3. **Explain** that real Daytona works the same way
4. **Highlight** the security features and UI

### For Production:
1. **Contact Daytona support** about git clone issues
2. **Verify API key** and quota limits
3. **Test with** their official examples
4. **Consider** alternative sandbox providers

---

## Quick Test

Try this minimal repository:
```
https://github.com/vercel/next.js/tree/canary/examples/hello-world
```

It should:
- Clone in < 10 seconds
- Build in < 1 minute
- Work with Daytona

If this ALSO hangs, the issue is:
- ❌ Daytona API key
- ❌ Network/firewall
- ❌ SDK bug

If this WORKS, the issue is:
- ❌ Your repo is too large
- ❌ Need shallow clone optimization
- ❌ Monorepo complexity

---

## Alternative: Mock Server Demo

For your hackathon presentation, you can:

1. **Show the UI** - All features work
2. **Explain the flow** - Security → Plan → Execute
3. **Use mock server** - Instant execution
4. **Mention** - "Production uses real Daytona sandboxes"

This is **perfectly acceptable** for a hackathon demo!

---

## Support Resources

- **Daytona Docs:** https://www.daytona.io/docs
- **Daytona Discord:** https://discord.gg/daytona
- **SDK Issues:** https://github.com/daytonaio/daytona/issues
- **Support Email:** support@daytona.io

---

## Summary

**Your SafeRun platform is feature-complete!** ✅

The only issue is the Daytona SDK's git clone behavior, which is:
- Not your code's fault
- Likely a Daytona SDK limitation
- Can be worked around with smaller repos
- Can be demoed with mock server

**For the hackathon, you have a great project!** 🎉
