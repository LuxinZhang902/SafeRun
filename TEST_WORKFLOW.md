# 🧪 Testing the Complete Daytona Workflow

## Prerequisites

1. **Environment configured:**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   DAYTONA_BASE_URL=http://localhost:3986
   ```

2. **Dependencies installed:**
   ```bash
   pnpm install
   ```

---

## Quick Test (5 Minutes)

### 1. Start All Services

```bash
pnpm dev:full
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════╗
║  🚀 Mock Daytona Server Running                      ║
║  📍 http://localhost:3986                            ║
╚═══════════════════════════════════════════════════════╝

🚀 SafeRun API server running on http://localhost:3000
▲ Next.js 14.2.33
- Local:        http://localhost:3001
```

### 2. Open Browser

```
http://localhost:3001
```

### 3. Test Security Check

**Input:**
```
https://github.com/remix-run/examples/tree/main/basic
```

**Click:** "Security Check" 🛡️

**Expected Result:**
- ✅ Risk Score: ~15-25 (Low)
- ✅ Readiness Score: ~85-95 (High)
- ✅ Security categories displayed
- ✅ No critical threats

### 4. Test Generate Plan

**Click:** "Generate Plan" 📋

**Expected Result:**
- ✅ Execution plan displayed
- ✅ YAML preview shown
- ✅ Steps: install → build → run
- ✅ Runtime: node:20
- ✅ "Execute Plan" button enabled

### 5. Test Daytona Execution

**Click:** "Execute Plan" ▶️

**Expected Logs (in UI):**
```
[INFO] Creating workspace for basic-remix-example
[SUCCESS] Workspace created: ws-1
[INFO] Cloning repository: https://github.com/...
[SUCCESS] Repository cloned successfully
[INFO] Executing: pnpm install
[SUCCESS] Dependencies installed
[INFO] Executing: npm run build
[SUCCESS] Build completed
[INFO] Executing: npm start
[SUCCESS] Server started on port 3000
[SUCCESS] Port 3000 exposed at: http://localhost:3000
[SUCCESS] Execution completed successfully
[INFO] Workspace destroyed
```

**Expected in Mock Daytona Terminal:**
```
✅ Created workspace: ws-1 (basic-remix-example, node:20)
🚀 Executing in ws-1: git clone https://github.com/...
🚀 Executing in ws-1: pnpm install
🚀 Executing in ws-1: npm run build
🚀 Executing in ws-1: npm start
🌐 Exposed port 3000 for ws-1: http://localhost:3000
🗑️  Destroyed workspace: ws-1
```

---

## Detailed Testing Scenarios

### Scenario 1: Safe Repository (Should Pass)

**Test Repo:**
```
https://github.com/remix-run/examples/tree/main/basic
```

**Expected Workflow:**
1. Security Check → Low risk (15-25)
2. Generate Plan → Success
3. Execute Plan → Success
4. Logs show all steps completed
5. Workspace cleaned up

**Verify:**
```bash
# Check mock Daytona logs
# Should see: Created → Executed → Destroyed
```

---

### Scenario 2: High-Risk Repository (Should Block)

**Test Repo (create a test with suspicious content):**
```
https://github.com/your-test-repo/malicious-example
```

**Expected Workflow:**
1. Security Check → High risk (≥ 50)
2. Generate Plan → Success (plan still generated)
3. Execute Plan → **BLOCKED** ❌

**Expected Error:**
```
⚠️ Execution blocked: Security risk level is too high
This repository contains security threats that prevent safe execution.
```

---

### Scenario 3: Skip Security Check

**Test:**
1. Enter URL
2. Click "Generate Plan" directly (skip Security Check)
3. See warning dialog:
   ```
   ⚠️ Security Check Recommended
   
   You haven't run a security check yet...
   
   Do you want to proceed anyway?
   ```
4. Click "OK"
5. Plan generated (security runs in background)

**Expected:**
- ✅ Warning shown
- ✅ Plan generated if user confirms
- ⚠️ Yellow warning: "Plan generated without security check"

---

### Scenario 4: Invalid Repository

**Test Repo:**
```
https://github.com/nonexistent/repo-404
```

**Expected:**
1. Security Check → Error: "Failed to fetch repository"
2. Generate Plan → Error: "Failed to generate plan"

---

### Scenario 5: Repository Without package.json

**Test Repo:**
```
https://github.com/torvalds/linux
```

**Expected:**
1. Security Check → Success (can analyze README)
2. Generate Plan → May fail or generate minimal plan
3. Execute Plan → May fail (no package.json)

---

## Verify Daytona Integration

### Check Mock Server Health

```bash
curl http://localhost:3986/health
```

**Expected:**
```json
{"status":"ok","message":"Mock Daytona Server Running"}
```

### Test Workspace Creation Manually

```bash
curl -X POST http://localhost:3986/workspace \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-workspace",
    "image": "node:20",
    "resources": {"memory": "2048M"},
    "user": "nonroot"
  }'
```

**Expected:**
```json
{
  "id": "ws-1",
  "name": "test-workspace",
  "status": "running"
}
```

### Test Command Execution

```bash
curl -X POST http://localhost:3986/workspace/ws-1/exec \
  -H "Content-Type: application/json" \
  -d '{
    "command": ["echo", "Hello from Daytona!"],
    "workdir": "/tmp"
  }'
```

**Expected:**
```json
{
  "stdout": "Hello from Daytona!\n",
  "stderr": "",
  "exitCode": 0
}
```

### Test Workspace Cleanup

```bash
curl -X DELETE http://localhost:3986/workspace/ws-1
```

**Expected:**
```json
{"success": true}
```

---

## Troubleshooting

### Issue: Port 3001 not accessible

**Check if web server started:**
```bash
lsof -i :3001
```

**Solution:**
```bash
# Kill any process on 3001
kill -9 $(lsof -t -i:3001)

# Restart
pnpm dev:full
```

### Issue: "Failed to fetch" errors in UI

**Check API server:**
```bash
curl http://localhost:3000/health
```

**Check CORS:**
```bash
# API should allow requests from localhost:3001
# Check apps/api/src/index.ts for CORS config
```

**Solution:**
```bash
# Restart API server
pnpm --filter api dev
```

### Issue: Mock Daytona not responding

**Check if running:**
```bash
curl http://localhost:3986/health
```

**Solution:**
```bash
# Kill and restart
kill -9 $(lsof -t -i:3986)
pnpm daytona:mock
```

### Issue: "ANTHROPIC_API_KEY is not set"

**Check .env file:**
```bash
cat .env | grep ANTHROPIC_API_KEY
```

**Solution:**
```bash
# Edit .env and add your key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env

# Restart API server
pnpm --filter api dev
```

### Issue: Execution logs not showing

**Check EventSource connection:**
```bash
# Open browser console (F12)
# Look for EventSource errors
```

**Solution:**
```bash
# Check if API is running
curl http://localhost:3000/api/execute/test-run-id/stream

# Should return SSE stream
```

---

## Success Criteria

✅ **All services start without errors**
✅ **Web UI loads at localhost:3001**
✅ **Security Check returns risk scores**
✅ **Generate Plan creates YAML plan**
✅ **Execute Plan shows real-time logs**
✅ **Mock Daytona logs show workspace lifecycle**
✅ **Workspace is cleaned up after execution**
✅ **No errors in browser console**
✅ **No errors in terminal logs**

---

## Test Repositories

### ✅ Safe Repos (Should Pass)

```
https://github.com/remix-run/examples/tree/main/basic
https://github.com/vercel/next.js/tree/canary/examples/hello-world
https://github.com/facebook/react/tree/main/fixtures/packaging
https://github.com/sindresorhus/is
```

### ⚠️ Medium Risk Repos (Should Warn)

```
# Repos with network calls, file system access, etc.
# Should show medium risk score (30-49)
```

### ❌ High Risk Repos (Should Block)

```
# Repos with eval(), exec(), dangerous patterns
# Should show high risk score (≥ 50)
# Execution should be blocked
```

---

## Next Steps

1. **Test with your own repository**
2. **Verify logs match expected output**
3. **Check workspace cleanup happens**
4. **Test error handling (invalid repos, network issues)**
5. **Share with team for testing**

Happy testing! 🚀
