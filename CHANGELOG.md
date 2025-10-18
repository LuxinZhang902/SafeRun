# Changelog

All notable changes to Initium will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

#### Core Features
- **Plan Generation API** (`POST /api/plan`)
  - AI-powered plan generation using Claude 3.5 Sonnet
  - Support for GitHub repository analysis
  - Automatic detection of project type and dependencies
  - YAML plan output

- **Execution API** (`POST /api/execute`)
  - Secure execution in isolated Daytona workspaces
  - Support for Node.js, Python, Rust, and Go runtimes
  - Deterministic verb-based command mapping
  - No raw shell command execution

- **Log Streaming API** (`GET /api/run/:id`)
  - Real-time log streaming via Server-Sent Events (SSE)
  - Structured log format with timestamps and levels
  - Execution status updates
  - Preview URL delivery

- **Status API** (`GET /api/run/:id/status`)
  - Non-streaming status checks
  - Execution metadata retrieval

#### Security Features
- Non-root container execution
- Network egress allowlist
- Memory limits per workspace (default: 2GB)
- Per-step and global timeouts
- Automatic workspace cleanup
- Input validation with Zod schemas

#### Web UI
- Modern Next.js 14 interface
- Repository URL input
- Plan generation and display
- Real-time log viewer
- Execution status display
- Preview URL links
- Error handling and display

#### Developer Experience
- TypeScript throughout
- Comprehensive test suite
- Detailed documentation
- Example plans
- Setup scripts
- Makefile for common tasks

#### Documentation
- README.md - Project overview
- QUICKSTART.md - 5-minute setup guide
- ARCHITECTURE.md - Technical deep dive
- API.md - Complete API reference
- DEPLOYMENT.md - Production deployment guide
- CONTRIBUTING.md - Contribution guidelines
- PROJECT_SUMMARY.md - Deliverables checklist

#### Testing
- Unit tests for plan schema validation
- Unit tests for executor verb mapper
- Support for Node.js, Python, Rust, Go runtimes
- Vitest test runner

#### Configuration
- Environment variable management
- Configurable timeouts and limits
- Flexible runtime support
- CORS configuration

### Technical Details

#### Dependencies
- **Backend**: Fastify 4.26, Anthropic SDK 0.27, Zod 3.22
- **Frontend**: Next.js 14.1, React 18.2, TailwindCSS 3.4
- **Testing**: Vitest 1.2
- **Package Manager**: pnpm

#### Supported Runtimes
- Node.js (install, build, run, test)
- Python (install, run, test)
- Rust (install, build, run, test)
- Go (install, build, run, test)

#### API Endpoints
- `GET /health` - Health check
- `POST /api/plan` - Generate execution plan
- `POST /api/execute` - Execute plan
- `GET /api/run/:id` - Stream logs (SSE)
- `GET /api/run/:id/status` - Get status

### Known Limitations

- In-memory execution state (not persistent)
- Single API server (no horizontal scaling yet)
- Polling-based SSE (not event-driven)
- No execution history UI
- No user authentication
- No rate limiting

### Future Enhancements

Planned for future releases:
- Browser Use integration for visual testing
- Redis for distributed state
- WebSocket for real-time updates
- Execution history and analytics
- User authentication and RBAC
- Rate limiting
- Prometheus metrics
- Artifact storage
- Multi-step dependencies
- Conditional execution
- Plan editor UI
- Workspace shell access

---

## [Unreleased]

### Planned
- Browser Use API integration
- Execution history persistence
- User authentication
- Rate limiting
- Prometheus metrics endpoint
- Artifact storage (S3/GCS)
- Plan validation improvements
- More runtime support (Ruby, Java, PHP)

---

## Version History

- **1.0.0** (2024-01-01) - Initial MVP release

---

## Migration Guides

### Upgrading to 1.0.0

This is the initial release. No migration needed.

---

## Breaking Changes

None yet. This is the initial release.

---

## Deprecations

None yet. This is the initial release.

---

## Security Fixes

None yet. This is the initial release.

---

For detailed commit history, see the [GitHub repository](https://github.com/your-org/initium).
