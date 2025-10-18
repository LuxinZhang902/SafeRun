# 🚀 Daytona Sandbox Management Scripts

Scripts for creating and managing Daytona sandboxes directly from the terminal.

## 📋 Available Scripts

### 1. `create-sandbox.ts` - Create New Sandbox

Creates a new Daytona sandbox with optional repository cloning.

**Basic Usage:**
```bash
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts
```

**With Options:**
```bash
# Custom repository
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts --repo https://github.com/user/repo

# Custom memory
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts --memory 4

# No repository clone
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts --no-clone

# All options
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts \
  --repo https://github.com/user/repo \
  --memory 4 \
  --image ubuntu:22.04
```

**Options:**
- `-r, --repo <url>` - Repository URL to clone
- `-i, --image <image>` - Docker image (default: ubuntu:22.04)
- `-m, --memory <gb>` - Memory in GiB (default: 2)
- `--no-clone` - Don't clone repository
- `-h, --help` - Show help

### 2. `manage-sandboxes.ts` - Manage Existing Sandboxes

Get information about existing sandboxes.

**Usage:**
```bash
# Show sandbox info
export $(cat .env | xargs) && cd apps/api && npx tsx ../../manage-sandboxes.ts info <sandbox-id>

# Show preview URLs
export $(cat .env | xargs) && cd apps/api && npx tsx ../../manage-sandboxes.ts url <sandbox-id>
```

**Example:**
```bash
export $(cat .env | xargs) && cd apps/api && npx tsx ../../manage-sandboxes.ts info 4f6f2980-4cc8-4971-901b-4af84657a719
```

### 3. `test-daytona.ts` - Test Daytona SDK

Tests the Daytona SDK functionality.

**Usage:**
```bash
export $(cat .env | xargs) && cd apps/api && npx tsx ../../test-daytona.ts
```

---

## 🎯 Quick Start

### Create a Sandbox with Default Settings

```bash
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts
```

This will:
1. ✅ Create a new Ubuntu 22.04 sandbox with 2 GiB memory
2. ✅ Clone `vercel/next-learn-starter` repository
3. ✅ Show preview URLs
4. ✅ Display sandbox ID

### Create a Sandbox for Your Project

```bash
export $(cat .env | xargs) && cd apps/api && npx tsx ../../create-sandbox.ts \
  --repo https://github.com/LuxinZhang902/SafeRun \
  --memory 4
```

---

## 📊 Example Output

```
======================================================================
🚀 Daytona Sandbox Creator
======================================================================

📡 Step 1: Initializing Daytona client...
✅ Client initialized

🏗️  Step 2: Creating new sandbox...
   Image: ubuntu:22.04
   Memory: 2 GiB
✅ Sandbox created in 1.23s
   Sandbox ID: 4f6f2980-4cc8-4971-901b-4af84657a719

📦 Step 3: Cloning repository...
   Repository: https://github.com/vercel/next-learn-starter
   Target path: repo
✅ Repository cloned in 1.72s

🔗 Step 4: Getting preview link...
✅ Preview URL: https://3000-4f6f2980-4cc8-4971-901b-4af84657a719.proxy.daytona.works

======================================================================
✅ Sandbox Ready!
======================================================================

📋 Sandbox Details:
   ID: 4f6f2980-4cc8-4971-901b-4af84657a719
   Image: ubuntu:22.04
   Memory: 2 GiB
   Repository: https://github.com/vercel/next-learn-starter
   Clone path: /repo

🌐 Access URLs:
   Port 3000: https://3000-4f6f2980-4cc8-4971-901b-4af84657a719.proxy.daytona.works
   Port 3001: https://3001-4f6f2980-4cc8-4971-901b-4af84657a719.proxy.daytona.works
   Port 8080: https://8080-4f6f2980-4cc8-4971-901b-4af84657a719.proxy.daytona.works

🛠️  Next Steps:
   1. Access the sandbox via preview URL
   2. Run commands using sandbox.process.executeCommand()
   3. Install dependencies: cd repo && pnpm install
   4. Build: npm run build
   5. Start: npm start

🗑️  Cleanup:
   To destroy this sandbox, run:
   await sandbox.delete()
```

---

## 🔧 Environment Variables

Make sure your `.env` file contains:

```env
DAYTONA_API_KEY=your_api_key_here
DAYTONA_BASE_URL=https://api.daytona.io
```

---

## 💡 Tips

1. **Keep Sandbox IDs:** Save the sandbox ID for later reference
2. **Multiple Ports:** Access different ports by changing the port number in the URL
3. **Cleanup:** Remember to destroy sandboxes when done to avoid charges
4. **Memory:** Use more memory (4-8 GiB) for larger projects

---

## 🐛 Troubleshooting

### "DAYTONA_API_KEY not found"
Make sure to export environment variables:
```bash
export $(cat .env | xargs)
```

### "Cannot find module '@daytonaio/sdk'"
Run from the `apps/api` directory:
```bash
cd apps/api && npx tsx ../../script-name.ts
```

### Git Clone Hangs
- Try a smaller repository
- Check network connection
- Verify API key permissions

---

## 📚 Related Files

- `cleanup-sandboxes.ts` - Clean up old sandboxes
- `test-daytona.ts` - Test Daytona SDK functionality
- `connect-sandbox.ts` - Attempt to connect to existing sandbox

---

## ✅ Current Working Sandbox

**Sandbox ID:** `4f6f2980-4cc8-4971-901b-4af84657a719`
**Preview URL:** https://3000-4f6f2980-4cc8-4971-901b-4af84657a719.proxy.daytona.works
**Status:** ✅ Active (repository cloned successfully)
