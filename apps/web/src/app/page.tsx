'use client';

import { useState, useEffect } from 'react';

interface Log {
  timestamp: string;
  level: 'info' | 'error' | 'success';
  message: string;
  step?: string;
}

interface ExecutionStatus {
  type?: string;
  status?: string;
  previewUrl?: string;
  error?: string;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/remix-run/examples/tree/main/basic');
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planYaml, setPlanYaml] = useState('');
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<ExecutionStatus>({});
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const generatePlan = async () => {
    setPlanLoading(true);
    setError('');
    setPlan(null);
    setPlanYaml('');

    try {
      const response = await fetch(`${API_BASE}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setPlan(data.plan);
      setPlanYaml(data.yaml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const executePlan = async () => {
    if (!plan) {
      setError('Please generate a plan first');
      return;
    }

    setLoading(true);
    setError('');
    setLogs([]);
    setStatus({});

    try {
      const response = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, plan }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to execute plan');
      }

      // Start streaming logs
      streamLogs(data.runId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute plan');
      setLoading(false);
    }
  };

  const streamLogs = (runId: string) => {
    const eventSource = new EventSource(`${API_BASE}/api/run/${runId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'complete') {
        setStatus(data);
        setLoading(false);
        eventSource.close();
      } else {
        setLogs((prev) => [...prev, data]);
      }
    };

    eventSource.onerror = () => {
      setError('Lost connection to server');
      setLoading(false);
      eventSource.close();
    };
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Initium
          </h1>
          <p className="text-gray-400">Secure code execution with Daytona integration</p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <label className="block text-sm font-medium mb-2">Repository URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || planLoading}
            />
            <button
              onClick={generatePlan}
              disabled={loading || planLoading || !repoUrl}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {planLoading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>

        {/* Plan Display */}
        {plan && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Generated Plan</h2>
              <button
                onClick={executePlan}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Executing...' : 'Execute Plan'}
              </button>
            </div>
            <pre className="bg-gray-900 rounded p-4 overflow-x-auto text-sm">
              <code className="text-gray-300">{planYaml}</code>
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Execution Logs</h2>
            <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, idx) => (
                <div key={idx} className={`mb-1 ${getLogColor(log.level)}`}>
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  {log.step && <span className="text-blue-400"> [{log.step}]</span>}
                  <span> {log.message}</span>
                </div>
              ))}
              {loading && (
                <div className="text-gray-500 animate-pulse">
                  <span>● Streaming logs...</span>
                </div>
              )}
            </div>

            {/* Status Display */}
            {status.type === 'complete' && (
              <div className="mt-4 p-4 bg-gray-900 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={
                      status.status === 'success'
                        ? 'text-green-400'
                        : status.status === 'failed'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }
                  >
                    {status.status?.toUpperCase()}
                  </span>
                </div>
                {status.previewUrl && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Preview:</span>
                    <a
                      href={status.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {status.previewUrl}
                    </a>
                  </div>
                )}
                {status.error && (
                  <div className="mt-2 text-red-400">
                    <span className="font-semibold">Error:</span> {status.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!plan && !loading && !planLoading && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">How to use</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Paste a GitHub repository URL (e.g., https://github.com/remix-run/examples/tree/main/basic)</li>
              <li>Click "Generate Plan" to analyze the repository and create an execution plan</li>
              <li>Review the generated plan and click "Execute Plan" to run it</li>
              <li>Watch the logs stream in real-time</li>
              <li>If the app exposes a port, you'll get a preview URL</li>
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
