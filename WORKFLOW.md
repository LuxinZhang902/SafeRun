# 🔄 SafeRun Workflow - Security with AI, Execution without AI

## Overview

SafeRun now uses a **hybrid approach**:
- ✅ **Security Analysis**: Uses AI (Anthropic Claude) - **Requires API Key**
- ✅ **Plan Generation**: Simple detection - **No AI, No API Key**
- ✅ **Execution**: Uses Daytona sandboxes

---

## Complete Workflow

```
┌─────────────────────────────────────────────────────────┐
│  USER ENTERS GITHUB URL                                 │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 1: SECURITY CHECK (AI-Powered)                   │
│  🔑 Requires: ANTHROPIC_API_KEY                         │
│                                                         │
│  1. Fetch repository files from GitHub                 │
│  2. Run PromptShield security scan (regex rules)       │
│  3. Send to Claude AI for deep analysis                │
│  4. Return: risk_score, risk_level, recommendations    │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  DISPLAY SECURITY RESULTS                               │
│  • Risk Score: 0-100                                    │
│  • Risk Level: Low/Medium/High/Critical                 │
│  • Readiness Score: 0-100                               │
│  • Security Categories & Recommendations                │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2: GENERATE PLAN (Simple Detection)              │
│  ✅ NO AI - NO API KEY NEEDED                           │
│                                                         │
│  1. Parse package.json                                  │
│  2. Detect package manager (npm/pnpm/yarn)             │
│  3. Detect runtime (node:20, python:3.11)              │
│  4. Find scripts (build, start, dev)                    │
│  5. Generate YAML plan with steps                       │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  DISPLAY EXECUTION PLAN                                 │
│  • YAML preview                                         │
│  • Steps: install → build → run                         │
│  • Runtime & ports                                      │
│  • "Execute Plan" button                                │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 3: EXECUTE PLAN (Daytona)                        │
│  🚀 Uses Daytona Sandboxes                              │
│                                                         │
│  1. Create isolated workspace                           │
│  2. Clone repository                                    │
│  3. Execute steps (install/build/run)                   │
│  4. Expose ports                                        │
│  5. Stream logs to UI                                   │
│  6. Cleanup workspace                                   │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Security Check + Generate Plan
```http
POST /api/plan
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "version": "1.0",
    "name": "repo-name",
    "runtime": "node:20",
    "steps": [
      { "name": "Install dependencies", "verb": "install", "args": ["install"] },
      { "name": "Build application", "verb": "build", "args": ["run", "build"] },
      { "name": "Start application", "verb": "run", "args": ["start"] }
    ],
    "ports": [3000]
  },
  "yaml": "version: 1.0\nname: repo-name\n...",
  "security": {
    "risk_score": 25,
    "risk_level": "Low",
    "readiness_score": 85,
    "categories": [...],
    "explanation": "...",
    "recommendations": [...]
  }
}
```

### 2. Execute Plan
```http
POST /api/execute
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repo",
  "plan": { ... },
  "riskScore": 25,
  "riskLevel": "Low"
}
```

**Response:**
```json
{
  "success": true,
  "runId": "run-xyz789",
  "message": "Execution started in secure Daytona workspace"
}
```

### 3. Stream Logs
```http
GET /api/execute/{runId}/stream
Accept: text/event-stream
```

**Response:** Server-Sent Events (SSE)
```
data: {"timestamp":"...","level":"info","message":"Creating workspace"}
data: {"timestamp":"...","level":"success","message":"Workspace created: ws-1"}
data: {"timestamp":"...","level":"info","message":"Cloning repository"}
...
```

---

## What Uses AI vs What Doesn't

### ✅ Uses AI (Requires ANTHROPIC_API_KEY)

**Security Analysis Only:**
- Deep code analysis
- Threat detection
- Risk scoring
- Security recommendations
- Readiness assessment

**Files:**
- `apps/api/src/lib/llmSecurity.ts` - Claude security analysis
- `apps/api/src/lib/rules.ts` - PromptShield regex rules

### ❌ Does NOT Use AI (No API Key Needed)

**Plan Generation:**
- Package manager detection
- Script parsing
- Runtime detection
- Basic YAML plan creation

**Execution:**
- Daytona workspace management
- Git cloning
- Command execution
- Port exposure
- Cleanup

**Files:**
- `apps/api/src/lib/simplePlanGenerator.ts` - Simple plan logic
- `apps/api/src/lib/executor.ts` - Daytona execution
- `apps/api/src/lib/daytona.ts` - Daytona client

---

## Simple Plan Generation Logic

### Node.js Projects

**Detects:**
- `package.json` → Node.js project
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- Otherwise → npm

**Generates:**
```yaml
version: 1.0
name: my-app
runtime: node:20
steps:
  - name: Install dependencies
    verb: install
    args: [install]
  - name: Build application
    verb: build
    args: [run, build]      # If scripts.build exists
  - name: Start application
    verb: run
    args: [start]           # If scripts.start exists
ports: [3000]
```

### Python Projects

**Detects:**
- `requirements.txt` or `pyproject.toml` → Python project
- `app.py` or `main.py` → Entry point

**Generates:**
```yaml
version: 1.0
name: my-app
runtime: python:3.11
steps:
  - name: Install Python dependencies
    verb: install
    args: [install, -r, requirements.txt]
  - name: Run Python application
    verb: run
    args: [app.py]
ports: [5000]
```

---

## Environment Setup

### Required Environment Variables

```env
# ✅ REQUIRED for Security Check
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# ✅ REQUIRED for Execution
DAYTONA_BASE_URL=http://localhost:3986

# Optional
PORT=3000
NODE_ENV=development
WORKSPACE_TIMEOUT_MS=1800000
MAX_MEMORY_MB=2048
ALLOWED_EGRESS_DOMAINS=github.com,npmjs.com,registry.npmjs.org
```

### What Happens Without API Key?

**With API Key:**
```
Security Check → ✅ Works (AI analysis)
Generate Plan  → ✅ Works (simple detection)
Execute Plan   → ✅ Works (Daytona)
```

**Without API Key:**
```
Security Check → ❌ Fails (needs Claude)
Generate Plan  → ✅ Works (no AI needed)
Execute Plan   → ✅ Works (Daytona)
```

**Workaround:** You can skip Security Check and go directly to Generate Plan, but you'll see a warning.

---

## User Interface Flow

### 1. Initial State
```
┌────────────────────────────────────┐
│ Enter GitHub URL:                  │
│ [https://github.com/owner/repo]    │
│                                    │
│ [Security Check] [Generate Plan]   │
└────────────────────────────────────┘
```

### 2. After Security Check
```
┌────────────────────────────────────┐
│ ✅ Security analyzed                │
│                                    │
│ Risk Score: 25 (Low)               │
│ Readiness: 85%                     │
│                                    │
│ [Security Check] [Generate Plan]   │
└────────────────────────────────────┘
```

### 3. After Generate Plan
```
┌────────────────────────────────────┐
│ ✅ Security analyzed                │
│ ✅ Plan generated                   │
│                                    │
│ Execution Plan:                    │
│ • Install dependencies             │
│ • Build application                │
│ • Start application                │
│                                    │
│ [Execute Plan]                     │
└────────────────────────────────────┘
```

### 4. During Execution
```
┌────────────────────────────────────┐
│ 🚀 Executing...                     │
│                                    │
│ Logs:                              │
│ [INFO] Creating workspace          │
│ [SUCCESS] Workspace created: ws-1  │
│ [INFO] Cloning repository          │
│ [SUCCESS] Repository cloned        │
│ [INFO] Installing dependencies     │
│ ...                                │
└────────────────────────────────────┘
```

---

## Benefits of This Approach

### ✅ Advantages

1. **Security First**
   - AI-powered threat detection
   - Deep code analysis
   - Risk scoring

2. **Fast Plan Generation**
   - No AI latency
   - No API costs for plan generation
   - Reliable detection

3. **Flexible**
   - Can skip security check if needed
   - Works with or without full API key

4. **Cost-Effective**
   - Only uses AI for security (1 API call)
   - Plan generation is free
   - Execution uses Daytona (no AI)

### ⚠️ Limitations

1. **Simple Plans Only**
   - Basic install/build/run detection
   - No complex workflow analysis
   - May miss edge cases

2. **Requires Standard Structure**
   - Needs package.json with scripts
   - Assumes common patterns
   - May not work for unusual setups

3. **Security Check Still Needs AI**
   - Must have Anthropic API key
   - Can't skip if you want security analysis

---

## Testing the Workflow

### Test 1: Full Workflow (with API Key)

```bash
# 1. Set up environment
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env

# 2. Start servers
pnpm dev:full

# 3. Open browser
open http://localhost:3001

# 4. Test
# - Enter: https://github.com/remix-run/examples/tree/main/basic
# - Click "Security Check" → Should show Low risk
# - Click "Generate Plan" → Should show install/build/run steps
# - Click "Execute Plan" → Should execute in Daytona
```

### Test 2: Skip Security (without API Key)

```bash
# 1. Don't set ANTHROPIC_API_KEY

# 2. Start servers
pnpm dev:full

# 3. Open browser
open http://localhost:3001

# 4. Test
# - Enter: https://github.com/remix-run/examples/tree/main/basic
# - Click "Generate Plan" directly → Should work!
# - See warning: "Plan generated without security check"
# - Click "Execute Plan" → Should execute in Daytona
```

---

## Summary

**Current Workflow:**
1. **Security Check** → AI (Claude) → Requires API key
2. **Generate Plan** → Simple detection → No API key needed
3. **Execute Plan** → Daytona → No API key needed

**API Key Usage:**
- ✅ Security analysis only
- ❌ NOT for plan generation
- ❌ NOT for execution

**Result:**
- Best of both worlds: AI security + fast plan generation
- Can work without API key (skip security check)
- Daytona handles all execution

🚀 Ready to use!
