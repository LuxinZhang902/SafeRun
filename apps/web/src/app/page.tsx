'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

// Threat Panel Character Component
function ThreatPanelCharacter({ riskScore, riskLevel }: { riskScore: number; riskLevel: string }) {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev % 3) + 1);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const getCharacterPath = () => {
    if (riskScore === 0 || riskLevel === 'low') {
      return `/threat-panel/office/office_cat_thumbsup_${frame}.png`;
    } else if (riskScore < 30) {
      return `/threat-panel/office/office_dog_happy_${frame}.png`;
    } else if (riskScore < 50) {
      return `/threat-panel/cyber/cat_cyber_idle_0${frame}.png`;
    } else if (riskScore < 70) {
      return `/threat-panel/cyber/cat_cyber_angry_0${frame}.png`;
    } else if (riskScore < 85) {
      return `/threat-panel/cyber/cat_cyber_angrier_0${frame}.png`;
    } else {
      return `/threat-panel/cyber/cat_cyber_veryangry_0${frame}.png`;
    }
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <Image
        src={getCharacterPath()}
        alt="Threat Level"
        width={192}
        height={192}
        className="object-contain"
        priority
      />
    </div>
  );
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/vercel/next-learn-starter');
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planYaml, setPlanYaml] = useState('');
  const [security, setSecurity] = useState<SecurityInfo | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<ExecutionStatus>({});
  const [error, setError] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [demoRiskScore, setDemoRiskScore] = useState(50);
  const [showDemo, setShowDemo] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const analyzeSecurity = async () => {
    setSecurityLoading(true);
    setError('');
    setSecurity(null);

    try {
      const response = await fetch(`${API_BASE}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze security');
      }

      setSecurity(data.security);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze security');
    } finally {
      setSecurityLoading(false);
    }
  };

  const generatePlan = async () => {
    // Warn if security check hasn't been run
    if (!security) {
      const proceed = window.confirm(
        '⚠️ Security Check Recommended\n\n' +
          "You haven't run a security check yet. It's recommended to analyze the repository security before generating an execution plan.\n\n" +
          'Do you want to proceed anyway?'
      );

      if (!proceed) {
        return;
      }
    }

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
      if (!security) {
        setSecurity(data.security);
      }
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
    setStatus({});
    
    // Show immediate feedback
    setLogs([
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '🚀 Starting execution...',
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '📡 Connecting to execution server...',
      },
    ]);

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

      // Add log that execution started
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: '✅ Connected! Streaming logs in real-time...',
        },
      ]);

      // Store runId and start streaming logs
      setCurrentRunId(data.runId);
      streamLogs(data.runId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute plan');
      setLoading(false);
    }
  };

  const stopExecution = async () => {
    if (!currentRunId) return;

    try {
      setLoading(false);
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: '⚠️ Execution stopped by user',
        },
      ]);
      setStatus({ type: 'complete', status: 'failed', error: 'Stopped by user' });
      setCurrentRunId(null);
    } catch (err) {
      console.error('Failed to stop execution:', err);
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
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
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
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              How to Use
            </a>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-slate-700/50">
          <label className="block text-sm font-semibold mb-3 text-gray-300 text-center">
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
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
              disabled={loading || planLoading || securityLoading}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={analyzeSecurity}
                disabled={loading || planLoading || securityLoading || !repoUrl}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-orange-500/50 disabled:shadow-none flex items-center gap-2 justify-center"
              >
                {securityLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing Security...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Security Check
                  </>
                )}
              </button>

              <button
                onClick={generatePlan}
                disabled={loading || planLoading || securityLoading || !repoUrl}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50 disabled:shadow-none flex items-center gap-2 justify-center"
              >
                {planLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Generate Plan
                  </>
                )}
              </button>
            </div>

            {/* Helper text */}
            {!security && !securityLoading && !plan && !planLoading && (
              <p className="text-sm text-gray-400 text-center">
                💡 <strong>Recommended:</strong> Start with Security Check • Or skip directly to
                Generate Plan
              </p>
            )}
            {security && !plan && !planLoading && (
              <p className="text-sm text-gray-400 text-center">
                ✅ Security analyzed • Now generate an execution plan
              </p>
            )}
            {plan && !security && (
              <p className="text-sm text-yellow-400 text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Plan generated without security check
              </p>
            )}
          </div>

          {/* Interactive Demo Toggle */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showDemo ? 'Hide' : 'Show'} Threat Character Demo
            </button>
          </div>
        </div>

        {/* Interactive Threat Demo */}
        {showDemo && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-2 border-purple-500/30">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Interactive Threat Character Demo
                </h3>
                <p className="text-sm text-gray-400">Adjust the slider to see different threat levels and characters</p>
              </div>

              {/* Character Display */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="flex-shrink-0">
                  <ThreatPanelCharacter 
                    riskScore={demoRiskScore} 
                    riskLevel={demoRiskScore < 30 ? 'low' : demoRiskScore < 70 ? 'medium' : 'high'} 
                  />
                </div>
                
                <div className="flex-1 w-full">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-300">Risk Score</span>
                      <span className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                        demoRiskScore < 30 ? 'text-green-400 bg-green-500/20' :
                        demoRiskScore < 50 ? 'text-blue-400 bg-blue-500/20' :
                        demoRiskScore < 70 ? 'text-yellow-400 bg-yellow-500/20' :
                        demoRiskScore < 85 ? 'text-orange-400 bg-orange-500/20' :
                        'text-red-400 bg-red-500/20'
                      }`}>{demoRiskScore}</span>
                    </div>
                    
                    {/* Interactive Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={demoRiskScore}
                      onChange={(e) => setDemoRiskScore(parseInt(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, 
                          #10b981 0%, 
                          #3b82f6 20%, 
                          #eab308 40%, 
                          #f97316 60%, 
                          #ef4444 80%, 
                          #dc2626 100%)`
                      }}
                    />
                    
                    {/* Level Markers */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Threat Level Info */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        demoRiskScore < 30 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        demoRiskScore < 50 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                        demoRiskScore < 70 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        demoRiskScore < 85 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                        'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}>
                        {demoRiskScore < 30 ? 'SAFE / LOW RISK' :
                         demoRiskScore < 50 ? 'MEDIUM RISK' :
                         demoRiskScore < 70 ? 'HIGH RISK' :
                         demoRiskScore < 85 ? 'VERY HIGH RISK' :
                         'CRITICAL RISK'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {demoRiskScore < 30 ? '✅ Repository appears safe with minimal security concerns. Good to proceed with execution.' :
                       demoRiskScore < 50 ? '⚠️ Some security concerns detected. Review before execution recommended.' :
                       demoRiskScore < 70 ? '🔶 Significant security risks found. Careful review required before execution.' :
                       demoRiskScore < 85 ? '⛔ High security risks detected. Execution not recommended without mitigation.' :
                       '🚨 Critical security threats identified. Do not execute without thorough security review.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                {[
                  { score: 0, label: 'Safe', color: 'green' },
                  { score: 25, label: 'Low', color: 'blue' },
                  { score: 40, label: 'Medium', color: 'yellow' },
                  { score: 60, label: 'High', color: 'orange' },
                  { score: 75, label: 'V.High', color: 'red' },
                  { score: 90, label: 'Critical', color: 'rose' },
                ].map((preset) => (
                  <button
                    key={preset.score}
                    onClick={() => setDemoRiskScore(preset.score)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      Math.abs(demoRiskScore - preset.score) < 15
                        ? `bg-${preset.color}-500/30 text-${preset.color}-300 border-2 border-${preset.color}-500`
                        : `bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-${preset.color}-500/50`
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Demo Threat Categories */}
              <div className="bg-slate-800/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Demo Threat Categories
                </h4>
                <div className="space-y-3">
                  {(() => {
                    const categories = [];
                    
                    // Add categories based on risk score
                    if (demoRiskScore >= 20) {
                      categories.push({
                        name: 'Code Injection',
                        severity: demoRiskScore >= 70 ? 'high' : demoRiskScore >= 40 ? 'medium' : 'low',
                        description: 'Potential code injection vulnerabilities detected in user input handling'
                      });
                    }
                    
                    if (demoRiskScore >= 30) {
                      categories.push({
                        name: 'Dependency Risks',
                        severity: demoRiskScore >= 80 ? 'high' : demoRiskScore >= 50 ? 'medium' : 'low',
                        description: 'Outdated or vulnerable dependencies found in package.json'
                      });
                    }
                    
                    if (demoRiskScore >= 40) {
                      categories.push({
                        name: 'Authentication Issues',
                        severity: demoRiskScore >= 75 ? 'high' : 'medium',
                        description: 'Weak authentication mechanisms or missing security headers'
                      });
                    }
                    
                    if (demoRiskScore >= 50) {
                      categories.push({
                        name: 'Data Exposure',
                        severity: demoRiskScore >= 85 ? 'high' : 'medium',
                        description: 'Sensitive data may be exposed through API endpoints or logs'
                      });
                    }
                    
                    if (demoRiskScore >= 60) {
                      categories.push({
                        name: 'Malicious Patterns',
                        severity: 'high',
                        description: 'Suspicious code patterns that may indicate malicious intent'
                      });
                    }
                    
                    if (demoRiskScore >= 80) {
                      categories.push({
                        name: 'Critical Vulnerabilities',
                        severity: 'high',
                        description: 'Known CVEs or critical security flaws detected in codebase'
                      });
                    }
                    
                    if (categories.length === 0) {
                      categories.push({
                        name: 'No Threats Detected',
                        severity: 'low',
                        description: 'Repository appears clean with no significant security concerns'
                      });
                    }
                    
                    return categories.map((cat, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          cat.severity === 'high' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 
                          cat.severity === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 
                          'bg-blue-500 shadow-lg shadow-blue-500/50'
                        }`}></span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-200">{cat.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              cat.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              cat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {cat.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{cat.description}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Threat Count Summary */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Threats Detected:</span>
                    <span className="font-bold text-white">
                      {demoRiskScore < 20 ? '0' :
                       demoRiskScore < 30 ? '1' :
                       demoRiskScore < 40 ? '2' :
                       demoRiskScore < 50 ? '3' :
                       demoRiskScore < 60 ? '4' :
                       demoRiskScore < 80 ? '5' : '6'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Analysis */}
        {security && (
          <div className="mb-8 max-w-4xl mx-auto">
            {/* Threat Panel with Character */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Animated Character */}
                <div className="flex-shrink-0">
                  <ThreatPanelCharacter riskScore={security.risk_score} riskLevel={security.risk_level} />
                </div>
                
                {/* Risk Information */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 justify-center md:justify-start">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Security Analysis
                  </h3>
                  <div className="flex items-center gap-4 mb-4 justify-center md:justify-start flex-wrap">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRiskColor(security.risk_level)} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold">{security.risk_score}</span>
                    </div>
                    <div>
                      <span className={`inline-block px-4 py-2 rounded-lg border font-semibold text-sm ${getRiskBadgeColor(security.risk_level)}`}>
                        {security.risk_level.toUpperCase()} RISK
                      </span>
                      <p className="text-sm text-gray-300 mt-2">Readiness: {security.readiness_score}/100</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{security.explanation}</p>
                </div>
              </div>

              {/* Severity Level Bar */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <h4 className="text-sm font-semibold text-gray-400 mb-4 text-center">THREAT LEVEL SCALE</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { score: 0, label: 'Safe', color: 'from-green-500 to-emerald-600', character: 'cat', mood: 'thumbsup' },
                    { score: 25, label: 'Low', color: 'from-blue-500 to-cyan-600', character: 'dog', mood: 'happy' },
                    { score: 40, label: 'Medium', color: 'from-yellow-500 to-orange-500', character: 'cat', mood: 'idle' },
                    { score: 60, label: 'High', color: 'from-orange-500 to-red-500', character: 'cat', mood: 'angry' },
                    { score: 75, label: 'Very High', color: 'from-red-500 to-rose-600', character: 'cat', mood: 'angrier' },
                    { score: 90, label: 'Critical', color: 'from-rose-600 to-red-700', character: 'cat', mood: 'veryangry' },
                  ].map((level) => (
                    <div
                      key={level.score}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        security.risk_score >= level.score - 10 && security.risk_score <= level.score + 10
                          ? 'border-white shadow-lg scale-105'
                          : 'border-slate-700/50 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <Image
                          src={level.character === 'cat' 
                            ? (level.mood === 'thumbsup' 
                                ? '/threat-panel/office/office_cat_thumbsup_1.png'
                                : `/threat-panel/cyber/cat_cyber_${level.mood}_01.png`)
                            : '/threat-panel/office/office_dog_happy_1.png'}
                          alt={level.label}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                      <div className={`w-full h-1 rounded-full bg-gradient-to-r ${level.color} mb-2`}></div>
                      <p className="text-xs font-semibold text-center text-gray-300">{level.label}</p>
                      <p className="text-xs text-center text-gray-500">{level.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
            {/* Threat Categories */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Threat Categories
              </h3>
              <div className="space-y-3">
                {security.categories.map((cat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                    <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${cat.severity === 'high' ? 'bg-red-500' : cat.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200">{cat.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness Score Card */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Readiness Score
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold">{security.readiness_score}</span>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                      style={{ width: `${security.readiness_score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400">Repository execution readiness</p>
                </div>
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
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Execution Plan
              </h2>
              <div className="flex items-center gap-4">
                {/* Developer Mode Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devMode}
                    onChange={(e) => setDevMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">
                    🔧 Developer Mode (detailed logs)
                  </span>
                </label>
                
                {!loading ? (
                  <button
                    onClick={executePlan}
                    disabled={security ? security.risk_score >= 50 : false}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-green-500/50 disabled:shadow-none flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Execute Plan
                  </button>
                ) : (
                  <button
                    onClick={stopExecution}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                      />
                    </svg>
                    Stop Execution
                  </button>
                )}
              </div>
            </div>
            {security && security.risk_score >= 50 && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-red-400 font-semibold">Execution Blocked</p>
                  <p className="text-sm text-red-300/80">
                    This repository has a {security.risk_level} risk score and cannot be executed.
                  </p>
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
            <svg
              className="w-6 h-6 text-red-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
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
              <svg
                className="w-6 h-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Execution Logs
            </h2>
            <div className="bg-slate-950/70 rounded-xl p-6 h-96 overflow-y-auto font-mono text-sm border border-slate-700/30 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
              {logs.length === 0 && !loading && (
                <div className="text-gray-500 text-center py-8">
                  No logs yet. Click "Execute Plan" to start.
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className={`mb-1 ${getLogColor(log.level)}`}>
                  <span className="text-gray-500">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  {devMode && (
                    <span className="text-purple-400 text-xs"> [{log.level.toUpperCase()}]</span>
                  )}
                  {log.step && <span className="text-blue-400"> [{log.step}]</span>}
                  <span> {log.message}</span>
                  {devMode && log.message.length > 100 && (
                    <div className="ml-8 mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                      {/* Show full message in dev mode */}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-gray-500 animate-pulse">
                  <span>● Streaming logs in real-time...</span>
                  {devMode && <span className="text-xs ml-2">(Developer Mode Active)</span>}
                </div>
              )}
            </div>

            {/* Status Display */}
            {status.type === 'complete' && (
              <div className="mt-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status.status === 'success'
                        ? 'bg-green-500 animate-pulse'
                        : status.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  ></div>
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
                    <svg
                      className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Powered by SafeRun • Secured by AI • Built for Developers
          </p>
        </div>
      </div>
    </main>
  );
}
