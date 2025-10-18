# Initium Architecture

## Overview

Initium is a secure code execution platform that uses AI to analyze repositories and execute them in isolated environments.

## System Components

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│  Next.js UI │ (Port 3001)
└──────┬──────┘
       │ REST/SSE
       ▼
┌─────────────┐
│ Fastify API │ (Port 3000)
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   Claude    │ │   Daytona   │
│     API     │ │  Workspace  │
└─────────────┘ └─────────────┘
```

## Request Flow

### 1. Plan Generation Flow

```
User → Web UI → POST /api/plan
                    │
                    ├─→ repo.ts: fetchRepoContext()
                    │   └─→ Fetch README + manifests from GitHub
                    │
                    └─→ llm.ts: generatePlan()
                        └─→ Claude API: Analyze & generate YAML
                            └─→ planSchema.ts: Validate plan
                                └─→ Return plan to UI
```

### 2. Execution Flow

```
User → Web UI → POST /api/execute
                    │
                    └─→ executor.ts: executePlan()
                        │
                        ├─→ daytona.ts: createWorkspace()
                        │   └─→ Create isolated container
                        │
                        ├─→ daytona.ts: exec(['git', 'clone', ...])
                        │   └─→ Clone repository
                        │
                        ├─→ For each step:
                        │   ├─→ Map verb to command
                        │   └─→ daytona.ts: exec(command)
                        │       └─→ Stream logs to memory
                        │
                        ├─→ daytona.ts: expose(port)
                        │   └─→ Get preview URL
                        │
                        └─→ daytona.ts: destroy()
                            └─→ Cleanup workspace
```

### 3. Log Streaming Flow

```
User → Web UI → GET /api/run/:id (SSE)
                    │
                    └─→ run.ts: Stream logs
                        │
                        ├─→ Send existing logs
                        │
                        ├─→ Poll for new logs
                        │   └─→ executor.ts: getExecution(id)
                        │
                        └─→ Send completion event
                            └─→ Close SSE connection
```

## Security Architecture

### Defense in Depth

1. **Input Validation**
   - Zod schema validation for all plans
   - URL validation for repository URLs
   - No raw shell commands accepted

2. **Execution Isolation**
   - Each execution in separate Daytona workspace
   - Non-root user (UID 1000)
   - Network egress allowlist
   - Memory limits enforced

3. **Resource Management**
   - Per-step timeouts
   - Global workspace timeout (30 min)
   - Auto-cleanup on completion/failure
   - Memory caps (default 2GB)

4. **Verb Mapping**
   - Only 4 allowed verbs: install, build, run, test
   - Deterministic command mapping
   - No arbitrary command execution
   - Runtime-specific validation

### Security Boundaries

```
┌─────────────────────────────────────────┐
│          Initium API (Trusted)          │
│  ┌───────────────────────────────────┐  │
│  │   Verb Mapper (Command Whitelist) │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ Validated Commands Only
                  ▼
┌─────────────────────────────────────────┐
│         Daytona Workspace (Isolated)    │
│  ┌───────────────────────────────────┐  │
│  │  Container (Non-root, Limited)    │  │
│  │  - Memory: 2GB max                │  │
│  │  - Network: Allowlist only        │  │
│  │  - Timeout: 30 min max            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Data Flow

### Plan Schema

```typescript
Plan {
  version: "1.0"
  name: string
  runtime: string (Docker image)
  steps: [
    {
      name: string
      verb: "install" | "build" | "run" | "test"
      args?: string[]
      env?: Record<string, string>
      workdir?: string
      timeout?: number
    }
  ]
  ports?: number[]
  healthcheck?: string
}
```

### Execution State

```typescript
ExecutionResult {
  runId: string (nanoid)
  status: "running" | "success" | "failed" | "timeout"
  logs: ExecutionLog[]
  workspaceId?: string
  previewUrl?: string
  error?: string
}
```

### Log Format

```typescript
ExecutionLog {
  timestamp: ISO 8601 string
  level: "info" | "error" | "success"
  message: string
  step?: string (step name)
}
```

## Scalability Considerations

### Current Implementation (MVP)

- In-memory execution state
- Single API server
- Synchronous execution
- Polling-based SSE

### Future Improvements

1. **Distributed State**
   - Redis for execution state
   - Shared log storage (S3/GCS)
   - Multi-instance API servers

2. **Async Execution**
   - Queue-based execution (Bull/BullMQ)
   - Worker pool for parallel executions
   - Priority queues

3. **Real-time Updates**
   - WebSocket instead of SSE polling
   - Event-driven architecture
   - Pub/sub for log streaming

4. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Error tracking (Sentry)

## Error Handling

### Error Categories

1. **User Errors** (400-level)
   - Invalid repository URL
   - Invalid plan schema
   - Unsupported runtime

2. **Execution Errors** (500-level)
   - Daytona workspace creation failed
   - Command execution failed
   - Timeout exceeded

3. **System Errors**
   - Claude API unavailable
   - Daytona service down
   - Out of memory

### Error Recovery

- Automatic workspace cleanup on failure
- Graceful degradation (skip optional steps)
- Detailed error messages in logs
- Retry logic for transient failures

## Performance Optimization

### Current Optimizations

- Parallel manifest fetching
- Streaming logs (no buffering)
- Efficient SSE polling (1s interval)
- Early workspace cleanup

### Bottlenecks

- Claude API latency (2-5s)
- Git clone time (depends on repo size)
- Docker image pull (first time)
- Sequential step execution

### Optimization Opportunities

- Cache Claude responses
- Pre-warm common runtimes
- Parallel step execution (where safe)
- Incremental log streaming

## Testing Strategy

### Unit Tests

- Plan schema validation
- Verb mapper logic
- Error handling

### Integration Tests

- End-to-end plan generation
- Execution with mock Daytona
- SSE streaming

### Manual Testing

- Real repository execution
- Error scenarios
- UI/UX validation

## Deployment

### Requirements

- Node.js 20+
- Daytona instance
- Anthropic API key
- 2GB+ RAM per workspace

### Environment Variables

See `.env.example` for full list.

### Monitoring

- Health check: `GET /health`
- Execution status: `GET /api/run/:id/status`
- Server logs: Fastify logger

## Future Enhancements

1. **Browser Use Integration**
   - Visual testing
   - Screenshot capture
   - E2E test automation

2. **Advanced Features**
   - Multi-step dependencies
   - Conditional execution
   - Artifact storage
   - Test result parsing

3. **UI Improvements**
   - Plan editor
   - Execution history
   - Real-time metrics
   - Workspace shell access

4. **Security Enhancements**
   - Secrets management
   - RBAC
   - Audit logging
   - Rate limiting
