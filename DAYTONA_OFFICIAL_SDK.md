# 🚀 Using Official Daytona SDK

SafeRun now supports the **official Daytona SDK** (`@daytonaio/sdk`)!

## 📦 What's Integrated

We've integrated the official TypeScript SDK for Daytona, which provides:
- ✅ Real isolated sandboxes in the cloud
- ✅ Production-ready execution environment
- ✅ Official Daytona infrastructure
- ✅ Secure code execution

## 🔄 Two Modes Available

### **Mode 1: Mock Server (Development)**
```env
DAYTONA_BASE_URL=http://localhost:3986
# No API key needed
```

**Use for:**
- Local development
- Testing UI
- Quick demos
- Hackathon presentations

### **Mode 2: Official Daytona (Production)**
```env
DAYTONA_BASE_URL=https://api.daytona.io
DAYTONA_API_KEY=your-daytona-api-key-here
```

**Use for:**
- Real isolated execution
- Production deployments
- Secure code running
- Cloud-based sandboxes

---

## 🔑 Getting Daytona API Key

### **Step 1: Sign Up**
1. Go to https://www.daytona.io/
2. Create an account
3. Verify your email

### **Step 2: Get API Key**
1. Log in to Daytona dashboard
2. Navigate to **Settings** or **API Keys**
3. Click **Create New API Key**
4. Copy the key (starts with `dt-...` or similar)

### **Step 3: Configure SafeRun**
```bash
# Edit your .env file
nano .env

# Add:
DAYTONA_BASE_URL=https://api.daytona.io
DAYTONA_API_KEY=dt-your-actual-key-here
```

---

## 🔧 How It Works

### **SDK Integration**

```typescript
// apps/api/src/lib/daytona.ts
import { Daytona, type DaytonaConfig } from '@daytonaio/sdk';

const daytona = new Daytona({
  apiKey: process.env.DAYTONA_API_KEY,
  apiUrl: process.env.DAYTONA_BASE_URL,
});

// Create sandbox
const sandbox = await daytona.create({
  image: 'node:20',
  resources: { memory: 2048 },
});

// Execute command
const result = await sandbox.process.executeCommand('npm install');

// Cleanup
await sandbox.delete();
```

### **API Methods**

#### **1. Create Workspace**
```typescript
const workspace = await daytonaClient.createWorkspace({
  name: 'my-app',
  image: 'node:20',
  memoryMB: 2048,
});
// Returns: { id: 'sandbox-xyz', name: 'my-app', status: 'running' }
```

#### **2. Execute Command**
```typescript
const result = await daytonaClient.exec(workspaceId, ['npm', 'install'], {
  workdir: '/workspace/repo',
  env: { NODE_ENV: 'production' },
  timeout: 300000,
});
// Returns: { stdout: '...', stderr: '', exitCode: 0 }
```

#### **3. Expose Port**
```typescript
const exposed = await daytonaClient.expose(workspaceId, 3000);
// Returns: { url: 'https://sandbox-xyz-3000.daytona.app', port: 3000 }
```

#### **4. Destroy Workspace**
```typescript
await daytonaClient.destroy(workspaceId);
// Cleans up all resources
```

---

## 🆚 Mock vs Official Comparison

| Feature | Mock Server | Official Daytona |
|---------|-------------|------------------|
| **Isolation** | ❌ Runs on your machine | ✅ Real cloud sandboxes |
| **Security** | ⚠️ No isolation | ✅ Fully isolated |
| **Setup** | ✅ No account needed | ❌ Requires account |
| **Cost** | ✅ Free | 💰 Usage-based pricing |
| **Speed** | ✅ Instant | ⚠️ Network latency |
| **Production** | ❌ Not recommended | ✅ Production-ready |
| **API Key** | ✅ Not needed | ❌ Required |

---

## 🚀 Quick Start

### **Option 1: Use Mock Server (No Setup)**

```bash
# 1. Start mock server
pnpm dev:full

# 2. Use SafeRun
# - No API key needed
# - Works immediately
# - Good for demos
```

### **Option 2: Use Official Daytona**

```bash
# 1. Get Daytona API key from https://www.daytona.io/

# 2. Configure .env
echo "DAYTONA_BASE_URL=https://api.daytona.io" >> .env
echo "DAYTONA_API_KEY=your-key-here" >> .env

# 3. Start SafeRun
pnpm dev

# 4. Execute plans
# - Real cloud sandboxes
# - Fully isolated
# - Production-ready
```

---

## 📝 Environment Variables

```env
# Required for AI security analysis
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Daytona Configuration
# Choose one:

# Option A: Mock Server (Development)
DAYTONA_BASE_URL=http://localhost:3986

# Option B: Official Daytona (Production)
DAYTONA_BASE_URL=https://api.daytona.io
DAYTONA_API_KEY=dt-your-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Security Settings
WORKSPACE_TIMEOUT_MS=1800000
MAX_MEMORY_MB=2048
ALLOWED_EGRESS_DOMAINS=github.com,npmjs.com,registry.npmjs.org
```

---

## 🔍 Troubleshooting

### **Error: "Sandbox not found"**
- The SDK stores sandbox references in memory
- If the API server restarts, references are lost
- Solution: Don't restart server during execution

### **Error: "Authentication failed"**
- Check `DAYTONA_API_KEY` is set correctly
- Verify key is valid (not expired)
- Make sure `DAYTONA_BASE_URL` is correct

### **Error: "Rate limit exceeded"**
- You've hit Daytona's usage limits
- Wait a few minutes or upgrade plan
- Use mock server for development

### **Slow Execution**
- Official Daytona has network latency
- Creating sandboxes takes time (~10-30s)
- Use mock server for faster development

---

## 💡 Recommendations

### **For Development:**
- ✅ Use mock server
- ✅ Fast iteration
- ✅ No API costs
- ✅ Good for UI testing

### **For Demos:**
- ✅ Use mock server
- ✅ Show the workflow
- ✅ No external dependencies
- ⚠️ Mention it's a demo environment

### **For Production:**
- ✅ Use official Daytona
- ✅ Real isolation
- ✅ Secure execution
- ✅ Cloud infrastructure

---

## 📚 Resources

- **Daytona Website:** https://www.daytona.io/
- **Daytona Docs:** https://www.daytona.io/docs
- **SDK GitHub:** https://github.com/daytonaio/daytona
- **SDK Docs:** https://www.daytona.io/docs/en/typescript-sdk

---

## ✅ Summary

**Current Status:**
- ✅ Official Daytona SDK installed (`@daytonaio/sdk`)
- ✅ Client updated to use SDK
- ✅ Supports both mock and official modes
- ✅ Configuration via environment variables

**To Use Official Daytona:**
1. Get API key from https://www.daytona.io/
2. Set `DAYTONA_BASE_URL=https://api.daytona.io`
3. Set `DAYTONA_API_KEY=your-key-here`
4. Restart SafeRun

**To Use Mock Server:**
1. Set `DAYTONA_BASE_URL=http://localhost:3986`
2. Run `pnpm dev:full`
3. No API key needed

🚀 You're ready to use either mode!
