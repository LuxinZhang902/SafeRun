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

interface SecurityInfo {
  risk_score: number;
  risk_level: string;
  readiness_score: number;
  categories: Array<{ name: string; severity: string; description: string }>;
  explanation: string;
  recommendations: string[];
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/remix-run/examples/tree/main/basic');
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planYaml, setPlanYaml] = useState('');
  const [security, setSecurity] = useState<SecurityInfo | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<ExecutionStatus>({});
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const generatePlan = async () => {
    setPlanLoading(true);
    setError('');
    setPlan(null);
    setPlanYaml('');
    setSecurity(null);

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
      setSecurity(data.security);
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

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'from-green-500 to-emerald-600';
      case 'medium':
        return 'from-yellow-500 to-orange-500';
      case 'high':
        return 'from-orange-500 to-red-500';
      case 'critical':
        return 'from-red-600 to-rose-700';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              SafeRun
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-Powered Secure Code Execution Platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Multi-layer security • Real-time analysis • Isolated execution
          </p>
          <div className="mt-6">
            <a
              href="/how-to-use"
              className="inline-flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 px-6 py-3 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              How to Use
            </a>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-slate-700/50">
          <label className="block text-sm font-semibold mb-3 text-gray-300 text-center">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              GitHub Repository URL
            </span>
          </label>
          <div className="flex flex-col gap-4 items-center justify-center max-w-3xl mx-auto">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full bg-slate-900/70 border border-slate-600/50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-gray-500 text-white text-center"
              disabled={loading || planLoading}
            />
            <button
              onClick={generatePlan}
              disabled={loading || planLoading || !repoUrl}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50 disabled:shadow-none flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {planLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Analyze & Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Analysis */}
        {security && (
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
            {/* Risk Score Card */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Security Risk
              </h3>
              <div className="flex items-center gap-4">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRiskColor(security.risk_level)} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold">{security.risk_score}</span>
                </div>
                <div className="flex-1">
                  <span className={`inline-block px-4 py-2 rounded-lg border font-semibold text-sm ${getRiskBadgeColor(security.risk_level)}`}>
                    {security.risk_level.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{security.explanation}</p>
                </div>
              </div>
            </div>

            {/* Readiness Score Card */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Readiness Score
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold">{security.readiness_score}</span>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all" style={{width: `${security.readiness_score}%`}}></div>
                  </div>
                  <p className="text-sm text-gray-400">Repository execution readiness</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Display */}
        {plan && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Execution Plan
              </h2>
              <button
                onClick={executePlan}
                disabled={loading || (security ? security.risk_score >= 50 : false)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-green-500/50 disabled:shadow-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Execute Plan
                  </>
                )}
              </button>
            </div>
            {security && security.risk_score >= 50 && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-400 font-semibold">Execution Blocked</p>
                  <p className="text-sm text-red-300/80">This repository has a {security.risk_level} risk score and cannot be executed.</p>
                </div>
              </div>
            )}
            <pre className="bg-slate-950/70 rounded-xl p-6 overflow-x-auto text-sm border border-slate-700/30">
              <code className="text-gray-300 font-mono">{planYaml}</code>
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 mb-8 shadow-2xl flex items-start gap-4">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Execution Logs
            </h2>
            <div className="bg-slate-950/70 rounded-xl p-6 h-96 overflow-y-auto font-mono text-sm border border-slate-700/30 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
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
              <div className="mt-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${status.status === 'success' ? 'bg-green-500 animate-pulse' : status.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <span className="font-semibold text-gray-300">Execution Status:</span>
                  <span
                    className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                      status.status === 'success'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : status.status === 'failed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}
                  >
                    {status.status?.toUpperCase()}
                  </span>
                </div>
                {status.previewUrl && (
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <div className="flex-1">
                      <span className="font-semibold text-blue-300 block mb-1">Preview URL:</span>
                      <a
                        href={status.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline break-all transition-colors"
                      >
                        {status.previewUrl}
                      </a>
                    </div>
                  </div>
                )}
                {status.error && (
                  <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="font-semibold text-red-300">Error:</span>
                    <p className="text-red-400 mt-1">{status.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Powered by Daytona • Secured by AI • Built for Developers
          </p>
        </div>
      </div>
    </main>
  );
}
