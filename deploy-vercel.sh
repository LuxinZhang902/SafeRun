#!/bin/bash

echo "🚀 SafeRun Vercel Deployment Script"
echo "===================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Step 1: Building projects..."
pnpm build

echo ""
echo "🌐 Step 2: Deploying Frontend to Vercel..."
cd apps/web
vercel --prod
WEB_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*')
cd ../..

echo ""
echo "⚙️  Step 3: Deploying API to Vercel..."
cd apps/api
vercel --prod
API_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*')
cd ../..

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Your URLs:"
echo "   Frontend: $WEB_URL"
echo "   API:      $API_URL"
echo ""
echo "⚠️  Next Steps:"
echo "   1. Go to Vercel Dashboard"
echo "   2. Set NEXT_PUBLIC_API_URL=$API_URL in web app settings"
echo "   3. Set environment variables in API settings:"
echo "      - DAYTONA_API_KEY"
echo "      - DAYTONA_BASE_URL"
echo "      - ANTHROPIC_API_KEY (optional)"
echo "      - PROMPTSHIELD_API_KEY (optional)"
echo "   4. Redeploy both apps"
echo ""
echo "🎉 Happy hacking!"
