# Deployment Guide

This guide covers deploying SafeRun to production environments.

## Quick Start: Vercel Deployment 🚀

**Recommended for hackathons and demos!**

## Prerequisites

- Node.js 20+ runtime environment
- Daytona instance (accessible via HTTP)
- Anthropic API key
- 4GB+ RAM recommended
- SSL/TLS certificates (for HTTPS)

## Environment Variables

### Required

```env
# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-your-production-key

# Daytona Base URL
DAYTONA_BASE_URL=https://daytona.yourdomain.com

# Server Configuration
NODE_ENV=production
PORT=3000
```

### Optional

```env
# Browser Use (if using)
BROWSERUSE_API_KEY=your-browser-use-key

# Security Settings
WORKSPACE_TIMEOUT_MS=1800000
MAX_MEMORY_MB=2048
ALLOWED_EGRESS_DOMAINS=github.com,npmjs.com,registry.npmjs.org

# Web Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Deployment Options

### Option 1: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DAYTONA_BASE_URL=${DAYTONA_BASE_URL}
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:3000
    depends_on:
      - api
    restart: unless-stopped
```

Create `Dockerfile.api`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY tsconfig.json ./

# Build
RUN pnpm --filter api build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "--filter", "api", "start"]
```

Create `Dockerfile.web`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/web ./apps/web

# Build
RUN pnpm --filter web build

# Expose port
EXPOSE 3001

# Start
CMD ["pnpm", "--filter", "web", "start"]
```

Deploy:

```bash
docker-compose up -d
```

### Option 2: PM2 (Process Manager)

Install PM2:

```bash
npm install -g pm2
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'initium-api',
      cwd: './apps/api',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'initium-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Deploy:

```bash
# Build
pnpm build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 3: Kubernetes

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: initium-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: initium-api
  template:
    metadata:
      labels:
        app: initium-api
    spec:
      containers:
      - name: api
        image: your-registry/initium-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: initium-secrets
              key: anthropic-api-key
        - name: DAYTONA_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: initium-config
              key: daytona-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: initium-api
spec:
  selector:
    app: initium-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s/
```

### Option 4: Vercel (Recommended for Hackathons) 🚀

#### Step 1: Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Web App:**
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-api-url.vercel.app`

#### Step 2: Deploy API to Vercel

1. **Deploy API:**
   ```bash
   cd apps/api
   vercel --prod
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - `DAYTONA_API_KEY` = your Daytona API key
   - `DAYTONA_BASE_URL` = `https://api.daytona.io`
   - `ANTHROPIC_API_KEY` = your Anthropic API key (optional)
   - `PROMPTSHIELD_API_KEY` = your PromptShield key (optional)
   - `PORT` = `3000`

3. **Update Frontend URL:**
   - Go back to web app settings
   - Update `NEXT_PUBLIC_API_URL` with your deployed API URL

#### Alternative: Deploy API to Railway/Render

**Railway:**
1. Connect GitHub repository
2. Select `apps/api` as root directory
3. Set environment variables
4. Deploy automatically

**Render:**
1. Create new Web Service
2. Connect repository
3. Set root directory to `apps/api`
4. Add environment variables
5. Deploy

## Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/initium`:

```nginx
# API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support
        proxy_buffering off;
        proxy_cache off;
    }
}

# Web
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/initium /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Monitoring

### Health Checks

```bash
# API health
curl https://api.yourdomain.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Logging

#### PM2 Logs

```bash
pm2 logs initium-api
pm2 logs initium-web
```

#### Docker Logs

```bash
docker-compose logs -f api
docker-compose logs -f web
```

### Metrics

Add Prometheus metrics (future enhancement):

```typescript
// apps/api/src/metrics.ts
import { register, Counter, Histogram } from 'prom-client';

export const planGenerationCounter = new Counter({
  name: 'initium_plan_generation_total',
  help: 'Total number of plan generations',
});

export const executionDuration = new Histogram({
  name: 'initium_execution_duration_seconds',
  help: 'Execution duration in seconds',
});
```

## Security Checklist

- [ ] HTTPS enabled with valid certificates
- [ ] Environment variables secured (not in code)
- [ ] API rate limiting implemented
- [ ] CORS configured for production domains
- [ ] Secrets stored in secure vault (AWS Secrets Manager, etc.)
- [ ] Non-root user in containers
- [ ] Network egress allowlist configured
- [ ] Regular security updates
- [ ] Audit logging enabled

## Backup & Recovery

### Database (if added)

```bash
# Backup execution history
pg_dump initium > backup.sql

# Restore
psql initium < backup.sql
```

### Configuration

```bash
# Backup .env files
tar -czf config-backup.tar.gz .env apps/*/.env*
```

## Scaling

### Horizontal Scaling

- Run multiple API instances behind load balancer
- Use Redis for shared execution state
- Store logs in S3/GCS instead of memory

### Vertical Scaling

- Increase memory for more concurrent executions
- Add more CPU cores for faster builds
- Use faster storage for Docker images

## Troubleshooting

### High Memory Usage

```bash
# Check memory usage
docker stats

# Reduce MAX_MEMORY_MB in .env
MAX_MEMORY_MB=1024
```

### Slow Execution

- Pre-warm common Docker images
- Use faster Daytona instance
- Enable Claude response caching

### Connection Issues

```bash
# Test Daytona connectivity
curl $DAYTONA_BASE_URL/health

# Test Anthropic API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

## Cost Optimization

- Cache Claude responses (reduce API calls)
- Auto-scale based on load
- Use spot instances for workers
- Implement execution queue with priority

## Support

For deployment issues:
- Check logs first
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Open GitHub issue with deployment details

---

**Production Checklist**: Before going live, ensure all security measures are in place and monitoring is configured.
