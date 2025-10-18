# Initium API Documentation

Base URL: `http://localhost:3000` (development)

## Authentication

Currently no authentication required. In production, implement API keys or OAuth.

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200 OK` - Server is healthy

---

### Generate Plan

Analyze a GitHub repository and generate an execution plan using AI.

**Endpoint**: `POST /api/plan`

**Request Body**:
```json
{
  "repoUrl": "https://github.com/owner/repo"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| repoUrl | string | Yes | GitHub repository URL. Supports monorepo paths: `https://github.com/owner/repo/tree/branch/path` |

**Response**:
```json
{
  "success": true,
  "plan": {
    "version": "1.0",
    "name": "my-app",
    "runtime": "node:20",
    "steps": [
      {
        "name": "Install dependencies",
        "verb": "install",
        "timeout": 300000
      },
      {
        "name": "Build application",
        "verb": "build",
        "timeout": 600000
      },
      {
        "name": "Run application",
        "verb": "run",
        "env": {
          "PORT": "3000"
        }
      }
    ],
    "ports": [3000],
    "healthcheck": "/"
  },
  "yaml": "version: '1.0'\nname: my-app\n..."
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid GitHub URL. Expected format: https://github.com/owner/repo"
}
```

**Status Codes**:
- `200 OK` - Plan generated successfully
- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Failed to generate plan

**Example**:
```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/remix-run/examples/tree/main/basic"
  }'
```

---

### Execute Plan

Execute a plan in an isolated Daytona workspace.

**Endpoint**: `POST /api/execute`

**Request Body**:
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "plan": {
    "version": "1.0",
    "name": "my-app",
    "runtime": "node:20",
    "steps": [...]
  }
}
```

Or with YAML:
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "planYaml": "version: '1.0'\nname: my-app\n..."
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| repoUrl | string | Yes | GitHub repository URL |
| plan | object | No* | Plan object (from /api/plan) |
| planYaml | string | No* | Plan in YAML format |

*Either `plan` or `planYaml` must be provided.

**Response**:
```json
{
  "success": true,
  "runId": "V1StGXR8_Z5jdHi6B-myT",
  "message": "Execution started"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Either plan or planYaml must be provided"
}
```

**Status Codes**:
- `200 OK` - Execution started
- `400 Bad Request` - Invalid request body or plan
- `500 Internal Server Error` - Failed to start execution

**Example**:
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/remix-run/examples/tree/main/basic",
    "planYaml": "version: \"1.0\"\nname: remix-basic\nruntime: node:20\nsteps:\n  - name: Install\n    verb: install\n  - name: Build\n    verb: build\n  - name: Run\n    verb: run\nports:\n  - 3000"
  }'
```

---

### Stream Logs (SSE)

Stream execution logs in real-time using Server-Sent Events.

**Endpoint**: `GET /api/run/:id`

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Run ID from /api/execute |

**Response** (SSE stream):

Each event is a JSON object sent as `data: {...}\n\n`

**Log Event**:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "Starting step: Install dependencies",
  "step": "Install dependencies"
}
```

**Completion Event**:
```json
{
  "type": "complete",
  "status": "success",
  "previewUrl": "https://workspace-abc123.daytona.io",
  "error": null
}
```

**Log Levels**:
- `info` - Informational messages
- `success` - Step completed successfully
- `error` - Error messages

**Status Values**:
- `running` - Execution in progress
- `success` - Execution completed successfully
- `failed` - Execution failed
- `timeout` - Execution timed out

**Example**:
```bash
curl -N http://localhost:3000/api/run/V1StGXR8_Z5jdHi6B-myT
```

**JavaScript Example**:
```javascript
const eventSource = new EventSource('http://localhost:3000/api/run/V1StGXR8_Z5jdHi6B-myT');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'complete') {
    console.log('Execution complete:', data.status);
    if (data.previewUrl) {
      console.log('Preview URL:', data.previewUrl);
    }
    eventSource.close();
  } else {
    console.log(`[${data.level}] ${data.message}`);
  }
};

eventSource.onerror = () => {
  console.error('Connection lost');
  eventSource.close();
};
```

---

### Get Execution Status

Get the current status of an execution without streaming.

**Endpoint**: `GET /api/run/:id/status`

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Run ID from /api/execute |

**Response**:
```json
{
  "success": true,
  "execution": {
    "runId": "V1StGXR8_Z5jdHi6B-myT",
    "status": "success",
    "previewUrl": "https://workspace-abc123.daytona.io",
    "error": null,
    "logCount": 42
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Execution not found"
}
```

**Status Codes**:
- `200 OK` - Status retrieved
- `404 Not Found` - Execution not found

**Example**:
```bash
curl http://localhost:3000/api/run/V1StGXR8_Z5jdHi6B-myT/status
```

---

## Plan Schema

### Plan Object

```typescript
{
  version: "1.0",              // Always "1.0"
  name: string,                // Project name
  runtime: string,             // Docker image (e.g., "node:20", "python:3.11")
  steps: PlanStep[],           // Array of execution steps
  ports?: number[],            // Optional: Ports to expose
  healthcheck?: string         // Optional: Health check path
}
```

### PlanStep Object

```typescript
{
  name: string,                // Step name
  verb: "install" | "build" | "run" | "test",  // Execution verb
  args?: string[],             // Optional: Additional arguments
  env?: Record<string, string>, // Optional: Environment variables
  workdir?: string,            // Optional: Working directory
  timeout?: number             // Optional: Timeout in milliseconds
}
```

### Supported Verbs

| Verb | Node.js | Python | Rust | Go |
|------|---------|--------|------|-----|
| install | `pnpm install` | `pip install -r requirements.txt` | `cargo fetch` | `go mod download` |
| build | `npm run build` | N/A | `cargo build --release` | `go build` |
| run | `npm start` | `python main.py` | `cargo run --release` | `go run .` |
| test | `npm test` | `pytest` | `cargo test` | `go test ./...` |

### Example Plans

**Node.js/React**:
```yaml
version: "1.0"
name: react-app
runtime: node:20
steps:
  - name: Install dependencies
    verb: install
    timeout: 300000
  - name: Build application
    verb: build
    timeout: 600000
  - name: Run application
    verb: run
    env:
      PORT: "3000"
ports:
  - 3000
healthcheck: /
```

**Python/Flask**:
```yaml
version: "1.0"
name: flask-app
runtime: python:3.11
steps:
  - name: Install dependencies
    verb: install
  - name: Run application
    verb: run
    args: ["app.py"]
    env:
      FLASK_APP: app.py
      PORT: "5000"
ports:
  - 5000
healthcheck: /health
```

---

## Error Handling

### Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Errors

**Invalid Repository URL**:
```json
{
  "success": false,
  "error": "Invalid GitHub URL. Expected format: https://github.com/owner/repo"
}
```

**Repository Not Found**:
```json
{
  "success": false,
  "error": "Could not fetch any repository context. Ensure the repository is public and the URL is correct."
}
```

**Invalid Plan Schema**:
```json
{
  "success": false,
  "error": "Invalid plan: steps[0].verb must be one of: install, build, run, test"
}
```

**Workspace Creation Failed**:
```json
{
  "success": false,
  "error": "Failed to create workspace: Connection refused"
}
```

**Execution Failed**:
```json
{
  "success": false,
  "error": "Command failed with exit code 1"
}
```

---

## Rate Limiting

Currently no rate limiting. In production, implement:
- 10 plan generations per minute per IP
- 5 executions per minute per IP
- 100 status checks per minute per IP

---

## CORS

Development: All origins allowed (`*`)
Production: Configure specific origins in `.env`

---

## Webhooks (Future)

Not yet implemented. Future enhancement to notify on execution completion:

```json
POST https://your-webhook-url.com/callback
{
  "runId": "V1StGXR8_Z5jdHi6B-myT",
  "status": "success",
  "previewUrl": "https://workspace-abc123.daytona.io",
  "duration": 45000
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
class InitiumClient {
  constructor(private baseUrl: string) {}

  async generatePlan(repoUrl: string) {
    const response = await fetch(`${this.baseUrl}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });
    return response.json();
  }

  async executePlan(repoUrl: string, plan: any) {
    const response = await fetch(`${this.baseUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, plan }),
    });
    return response.json();
  }

  streamLogs(runId: string, onLog: (log: any) => void, onComplete: (status: any) => void) {
    const eventSource = new EventSource(`${this.baseUrl}/api/run/${runId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'complete') {
        onComplete(data);
        eventSource.close();
      } else {
        onLog(data);
      }
    };
    
    return eventSource;
  }
}

// Usage
const client = new InitiumClient('http://localhost:3000');

const { plan } = await client.generatePlan('https://github.com/owner/repo');
const { runId } = await client.executePlan('https://github.com/owner/repo', plan);

client.streamLogs(
  runId,
  (log) => console.log(log.message),
  (status) => console.log('Complete:', status)
);
```

### Python

```python
import requests
import json

class InitiumClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def generate_plan(self, repo_url):
        response = requests.post(
            f"{self.base_url}/api/plan",
            json={"repoUrl": repo_url}
        )
        return response.json()
    
    def execute_plan(self, repo_url, plan):
        response = requests.post(
            f"{self.base_url}/api/execute",
            json={"repoUrl": repo_url, "plan": plan}
        )
        return response.json()
    
    def stream_logs(self, run_id):
        response = requests.get(
            f"{self.base_url}/api/run/{run_id}",
            stream=True
        )
        
        for line in response.iter_lines():
            if line.startswith(b'data: '):
                data = json.loads(line[6:])
                yield data

# Usage
client = InitiumClient('http://localhost:3000')

plan_result = client.generate_plan('https://github.com/owner/repo')
exec_result = client.execute_plan('https://github.com/owner/repo', plan_result['plan'])

for log in client.stream_logs(exec_result['runId']):
    if log.get('type') == 'complete':
        print(f"Complete: {log['status']}")
        break
    else:
        print(log['message'])
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Support

For API issues, open a GitHub issue with:
- Endpoint called
- Request body
- Response received
- Expected behavior
