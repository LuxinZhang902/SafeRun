# 🚀 Vercel Deployment Guide for SafeRun

Quick guide to deploy SafeRun to Vercel for hackathon demos and production.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works!)
- Daytona API key
- Your repository pushed to GitHub

---

## 🎯 Quick Deploy (5 minutes)

### Method 1: Vercel Dashboard (Easiest)

#### Deploy Frontend

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "Add New Project"**

3. **Import your GitHub repository**

4. **Configure Frontend:**
   - **Root Directory:** `apps/web`
   - **Framework Preset:** Next.js
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter web build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`

5. **Add Environment Variable:**
   - `NEXT_PUBLIC_API_URL` = `https://your-api-url.vercel.app` (add after API is deployed)

6. **Click "Deploy"**

#### Deploy API

1. **Click "Add New Project" again**

2. **Import the same repository**

3. **Configure API:**
   - **Root Directory:** `apps/api`
   - **Framework Preset:** Other
   - **Build Command:** `cd ../.. && pnpm install && pnpm --filter api build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

4. **Add Environment Variables:**
   ```
   DAYTONA_API_KEY=your_daytona_api_key
   DAYTONA_BASE_URL=https://api.daytona.io
   ANTHROPIC_API_KEY=your_anthropic_key (optional)
   PROMPTSHIELD_API_KEY=your_promptshield_key (optional)
   PORT=3000
   ```

5. **Click "Deploy"**

6. **Copy the API URL** (e.g., `https://saferun-api.vercel.app`)

7. **Go back to Frontend settings** → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` with your API URL
   - Redeploy frontend

---

### Method 2: Vercel CLI (Faster for developers)

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Deploy Frontend

```bash
cd apps/web
vercel --prod
```

Follow prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** saferun-web
- **Directory?** ./
- **Override settings?** No

#### Deploy API

```bash
cd apps/api
vercel --prod
```

Follow prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** saferun-api
- **Directory?** ./
- **Override settings?** No

#### Set Environment Variables

```bash
# For API
cd apps/api
vercel env add DAYTONA_API_KEY production
vercel env add DAYTONA_BASE_URL production
vercel env add ANTHROPIC_API_KEY production

# For Frontend
cd apps/web
vercel env add NEXT_PUBLIC_API_URL production
```

Then redeploy:
```bash
vercel --prod
```

---

### Method 3: Automated Script

```bash
./deploy-vercel.sh
```

This script will:
1. Build both projects
2. Deploy frontend to Vercel
3. Deploy API to Vercel
4. Show you the URLs

---

## ⚙️ Environment Variables Reference

### Frontend (`apps/web`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your deployed API URL | `https://saferun-api.vercel.app` |

### API (`apps/api`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DAYTONA_API_KEY` | ✅ Yes | Your Daytona API key |
| `DAYTONA_BASE_URL` | ✅ Yes | Daytona API URL (usually `https://api.daytona.io`) |
| `ANTHROPIC_API_KEY` | ⚠️ Optional | For AI-powered security analysis |
| `PROMPTSHIELD_API_KEY` | ⚠️ Optional | For enhanced security scanning |
| `PORT` | No | Port number (default: 3000) |

---

## 🔧 Troubleshooting

### Build Fails: "Cannot find module"

**Solution:** Update build command to install from root:
```bash
cd ../.. && pnpm install && pnpm --filter web build
```

### API Returns 500 Error

**Check:**
1. Environment variables are set correctly
2. DAYTONA_API_KEY is valid
3. Check Vercel function logs

### Frontend Can't Connect to API

**Check:**
1. `NEXT_PUBLIC_API_URL` is set correctly
2. API is deployed and running
3. No CORS issues (API should allow your frontend domain)

### "Module not found: @daytonaio/sdk"

**Solution:** Ensure pnpm workspace is properly configured:
```bash
pnpm install --frozen-lockfile
```

---

## 🎨 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_API_URL` if using custom API domain

---

## 📊 Monitoring

### View Logs

**Vercel Dashboard:**
- Go to your project
- Click "Deployments"
- Click on a deployment
- View "Function Logs"

**CLI:**
```bash
vercel logs saferun-api
vercel logs saferun-web
```

### Performance

- Vercel automatically provides analytics
- Check "Analytics" tab in dashboard
- Monitor function execution time
- Track error rates

---

## 🚀 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Production:** Push to `main` branch
2. **Preview:** Push to any other branch

Configure in Vercel Dashboard:
- Settings → Git → Production Branch

---

## 💰 Cost Considerations

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function executions
- Automatic HTTPS

**Paid Plans:**
- More bandwidth
- Longer function execution time
- Team collaboration features

For hackathons, **free tier is sufficient!**

---

## 🎯 Quick Checklist

Before submitting your hackathon:

- [ ] Frontend deployed and accessible
- [ ] API deployed and accessible
- [ ] Environment variables set
- [ ] Frontend can connect to API
- [ ] Security check works
- [ ] Plan generation works
- [ ] Threat characters display correctly
- [ ] Demo mode works
- [ ] Custom domain configured (optional)
- [ ] README updated with live URLs

---

## 📝 Example URLs

After deployment, you'll have:

- **Frontend:** `https://saferun-web.vercel.app`
- **API:** `https://saferun-api.vercel.app`

Update your README with these URLs!

---

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- Check Vercel function logs
- Review build logs in dashboard

---

## 🎉 Success!

Your SafeRun platform is now live on Vercel!

**Share your demo:**
- Add URLs to your hackathon submission
- Share on social media
- Demo to judges
- Show off your threat characters! 🐱🐕

---

**Pro Tip:** Use the interactive demo mode to showcase your threat visualization system during presentations!
