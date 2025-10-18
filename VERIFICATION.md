# Initium MVP Verification Checklist

Use this checklist to verify that all components are working correctly.

## ✅ Pre-Flight Checks

### Environment Setup
- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] `.env` file created with required keys
- [ ] `apps/web/.env.local` created
- [ ] Dependencies installed (`pnpm install`)

### External Services
- [ ] Daytona instance running and accessible
- [ ] Anthropic API key valid
- [ ] Network connectivity to GitHub

## ✅ Build Verification

### API Build
```bash
cd apps/api
pnpm build
```
- [ ] TypeScript compilation successful
- [ ] No type errors
- [ ] `dist/` directory created

### Web Build
```bash
cd apps/web
pnpm build
```
- [ ] Next.js build successful
- [ ] No build errors
- [ ] `.next/` directory created

## ✅ Test Verification

### Unit Tests
```bash
pnpm test
```
- [ ] All plan schema tests pass (11 tests)
- [ ] All executor verb mapper tests pass (20+ tests)
- [ ] No test failures
- [ ] Test coverage adequate

### Test Coverage
- [ ] `planSchema.ts` - Validation logic
- [ ] `executor.ts` - Verb mapping logic
- [ ] Node.js runtime support
- [ ] Python runtime support
- [ ] Rust runtime support
- [ ] Go runtime support
- [ ] Error handling

## ✅ API Endpoint Verification

### Health Check
```bash
curl http://localhost:3000/health
```
Expected:
```json
{"status":"ok","timestamp":"..."}
```
- [ ] Returns 200 OK
- [ ] JSON response valid

### Plan Generation
```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/remix-run/examples/tree/main/basic"}'
```
Expected:
- [ ] Returns 200 OK
- [ ] `success: true`
- [ ] Valid plan object
- [ ] YAML string included
- [ ] Plan has steps array
- [ ] Plan has runtime specified

### Plan Execution
```bash
# First generate a plan, then execute it
PLAN='{"version":"1.0","name":"test","runtime":"node:20","steps":[{"name":"Install","verb":"install"}]}'
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d "{\"repoUrl\":\"https://github.com/remix-run/examples/tree/main/basic\",\"plan\":$PLAN}"
```
Expected:
- [ ] Returns 200 OK
- [ ] `success: true`
- [ ] `runId` returned
- [ ] Execution starts

### Log Streaming
```bash
# Use runId from previous step
curl -N http://localhost:3000/api/run/YOUR_RUN_ID
```
Expected:
- [ ] SSE stream starts
- [ ] Log events received
- [ ] Completion event received
- [ ] Stream closes properly

### Status Check
```bash
curl http://localhost:3000/api/run/YOUR_RUN_ID/status
```
Expected:
- [ ] Returns 200 OK
- [ ] Status object returned
- [ ] `runId` matches
- [ ] `status` field present

## ✅ Web UI Verification

### Page Load
Navigate to `http://localhost:3001`
- [ ] Page loads without errors
- [ ] No console errors
- [ ] UI renders correctly
- [ ] Input field visible
- [ ] Generate Plan button visible

### Plan Generation Flow
1. Paste URL: `https://github.com/remix-run/examples/tree/main/basic`
2. Click "Generate Plan"

Verify:
- [ ] Loading state shows
- [ ] Plan appears after generation
- [ ] YAML is formatted correctly
- [ ] Execute Plan button appears
- [ ] No errors displayed

### Execution Flow
1. Click "Execute Plan"

Verify:
- [ ] Loading state shows
- [ ] Logs section appears
- [ ] Logs stream in real-time
- [ ] Timestamps visible
- [ ] Log levels color-coded
- [ ] Completion status shows
- [ ] Preview URL displayed (if applicable)

### Error Handling
Test with invalid URL: `https://invalid-url`
- [ ] Error message displayed
- [ ] Error is user-friendly
- [ ] UI remains functional

## ✅ Security Verification

### Verb Restriction
Try to execute a plan with invalid verb:
```json
{
  "version": "1.0",
  "name": "test",
  "runtime": "node:20",
  "steps": [{"name": "Bad", "verb": "rm -rf /"}]
}
```
- [ ] Request rejected
- [ ] Error message returned
- [ ] No execution started

### Schema Validation
Try invalid plan structure:
```json
{
  "version": "2.0",
  "name": "test"
}
```
- [ ] Validation fails
- [ ] Clear error message
- [ ] No execution started

### Timeout Enforcement
- [ ] Steps respect timeout settings
- [ ] Global timeout enforced (30 min)
- [ ] Workspace destroyed on timeout

### Resource Limits
- [ ] Memory limit enforced
- [ ] Non-root user in container
- [ ] Network egress restricted

### Auto-Cleanup
- [ ] Workspace destroyed on success
- [ ] Workspace destroyed on failure
- [ ] Workspace destroyed on timeout

## ✅ Integration Verification

### Daytona Integration
- [ ] Workspace creation works
- [ ] Command execution works
- [ ] Port exposure works
- [ ] Workspace destruction works
- [ ] Error handling works

### Claude Integration
- [ ] Plan generation works
- [ ] Context analysis accurate
- [ ] YAML output valid
- [ ] Error handling works

### GitHub Integration
- [ ] README fetching works
- [ ] Manifest fetching works
- [ ] Monorepo paths work
- [ ] Error handling works

## ✅ Performance Verification

### Response Times
- [ ] Health check < 50ms
- [ ] Plan generation < 10s
- [ ] Execution start < 2s
- [ ] Log streaming < 100ms latency

### Resource Usage
- [ ] API memory usage reasonable
- [ ] Web memory usage reasonable
- [ ] No memory leaks
- [ ] CPU usage acceptable

## ✅ Documentation Verification

### Completeness
- [ ] README.md complete
- [ ] QUICKSTART.md accurate
- [ ] ARCHITECTURE.md detailed
- [ ] API.md comprehensive
- [ ] DEPLOYMENT.md helpful
- [ ] CONTRIBUTING.md clear

### Accuracy
- [ ] All code examples work
- [ ] All commands execute
- [ ] All URLs valid
- [ ] No outdated information

### Examples
- [ ] Example plans valid
- [ ] Example repos work
- [ ] Scripts executable
- [ ] Setup instructions work

## ✅ Edge Cases

### Empty Repository
- [ ] Handles repos with no README
- [ ] Handles repos with no manifests
- [ ] Returns appropriate error

### Large Repository
- [ ] Handles large repos
- [ ] Timeout doesn't trigger prematurely
- [ ] Memory usage acceptable

### Network Issues
- [ ] Handles GitHub unavailable
- [ ] Handles Daytona unavailable
- [ ] Handles Claude API unavailable
- [ ] Error messages clear

### Concurrent Executions
- [ ] Multiple executions work
- [ ] No state conflicts
- [ ] Resources isolated

## ✅ Production Readiness

### Configuration
- [ ] All env vars documented
- [ ] Defaults sensible
- [ ] Validation present
- [ ] Secrets not in code

### Logging
- [ ] Errors logged
- [ ] Info logged appropriately
- [ ] No sensitive data in logs
- [ ] Log levels correct

### Error Handling
- [ ] All errors caught
- [ ] User-friendly messages
- [ ] Stack traces in dev only
- [ ] Graceful degradation

### Monitoring
- [ ] Health endpoint works
- [ ] Status endpoint works
- [ ] Metrics collectible
- [ ] Alerts configurable

## ✅ Final Checks

### Code Quality
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code formatted consistently
- [ ] No commented-out code

### Git
- [ ] .gitignore complete
- [ ] No secrets committed
- [ ] Clean commit history
- [ ] README accurate

### Deployment
- [ ] Build scripts work
- [ ] Start scripts work
- [ ] Environment variables set
- [ ] Dependencies installed

## 🎯 Acceptance Criteria

All original requirements met:
- [x] POST /api/plan endpoint
- [x] POST /api/execute endpoint
- [x] GET /api/run/:id endpoint
- [x] Daytona integration
- [x] Anthropic Claude integration
- [x] Browser Use integration points
- [x] Deterministic YAML execution
- [x] Log streaming
- [x] Minimal web UI
- [x] No raw shell commands
- [x] Timeouts enforced
- [x] Memory caps enforced
- [x] Non-root user
- [x] Network egress allowlist
- [x] Auto-destroy workspace
- [x] Clear error messages
- [x] Unit tests
- [x] Complete documentation
- [x] README with startup instructions
- [x] .env.example with API keys

## 📊 Test Results Summary

Record your test results:

```
Date: _______________
Tester: _______________

Total Checks: _____ / _____
Passed: _____
Failed: _____
Skipped: _____

Critical Issues: _____
Minor Issues: _____

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

## 🚀 Ready for Demo

- [ ] All critical checks pass
- [ ] Example execution works end-to-end
- [ ] UI is polished
- [ ] Documentation is clear
- [ ] Demo script prepared

---

**Sign-off**: _______________ Date: _______________
