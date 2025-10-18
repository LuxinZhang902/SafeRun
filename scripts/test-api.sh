#!/bin/bash

# API Testing Script
# Quick smoke tests for the Initium API

set -e

API_URL="${API_URL:-http://localhost:3000}"

echo "🧪 Testing Initium API at $API_URL"
echo ""

# Test 1: Health check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s "$API_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: Plan generation
echo ""
echo "2️⃣  Testing plan generation..."
PLAN_RESPONSE=$(curl -s -X POST "$API_URL/api/plan" \
    -H "Content-Type: application/json" \
    -d '{"repoUrl":"https://github.com/remix-run/examples/tree/main/basic"}')

if echo "$PLAN_RESPONSE" | grep -q "success"; then
    echo "✅ Plan generation passed"
    echo "   Plan name: $(echo $PLAN_RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Plan generation failed"
    echo "   Response: $PLAN_RESPONSE"
fi

echo ""
echo "✨ API tests complete!"
echo ""
echo "Note: Full execution tests require a running Daytona instance"
