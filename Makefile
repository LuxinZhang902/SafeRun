.PHONY: help install dev build test clean setup api web

help: ## Show this help message
	@echo "Initium MVP - Available Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Run initial setup
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	@pnpm install

dev: ## Start development servers (API + Web)
	@echo "🚀 Starting development servers..."
	@pnpm dev

api: ## Start only API server
	@echo "🚀 Starting API server..."
	@pnpm --filter api dev

web: ## Start only web server
	@echo "🚀 Starting web server..."
	@pnpm --filter web dev

build: ## Build for production
	@echo "🔨 Building for production..."
	@pnpm build

test: ## Run tests
	@echo "🧪 Running tests..."
	@pnpm test

test-api: ## Test API endpoints
	@chmod +x scripts/test-api.sh
	@./scripts/test-api.sh

clean: ## Clean build artifacts and dependencies
	@echo "🧹 Cleaning..."
	@rm -rf node_modules apps/*/node_modules apps/*/.next apps/*/dist
	@echo "✅ Clean complete"

format: ## Format code (if prettier is added)
	@echo "💅 Formatting code..."
	@pnpm prettier --write "apps/**/*.{ts,tsx,js,jsx,json,css,md}"

lint: ## Lint code (if eslint is added)
	@echo "🔍 Linting code..."
	@pnpm eslint "apps/**/*.{ts,tsx,js,jsx}"

start: ## Start production servers
	@echo "🚀 Starting production servers..."
	@pnpm start

check: ## Run all checks (test + build)
	@echo "✅ Running all checks..."
	@make test
	@make build
	@echo "✅ All checks passed!"

.DEFAULT_GOAL := help
