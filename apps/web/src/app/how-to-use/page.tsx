'use client';

export default function HowToUse() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <a href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to SafeRun
          </a>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                How to Use SafeRun
              </h1>
              <p className="text-gray-400 mt-2">Complete guide to secure code execution</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            Quick Start
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/50">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Enter Repository URL</h3>
                <p className="text-gray-400 mb-3">Paste any public GitHub repository URL into the input field.</p>
                <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-700/30">
                  <code className="text-sm text-green-400">https://github.com/remix-run/examples/tree/main/basic</code>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/50">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Analyze & Generate Plan</h3>
                <p className="text-gray-400">Click the "Analyze & Generate" button. SafeRun will:</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fetch repository contents (README, manifests, config files)
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Run PromptShield security scan (30+ detection rules)
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Perform AI-powered security analysis with Claude
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate deterministic YAML execution plan
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/50">
                <span className="text-yellow-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Review Security Analysis</h3>
                <p className="text-gray-400 mb-3">Check the security cards that appear:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="font-semibold text-red-400 mb-2">🛡️ Risk Score (0-100)</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• <span className="text-green-400">0-24:</span> Low Risk ✅</li>
                      <li>• <span className="text-yellow-400">25-49:</span> Medium Risk ⚠️</li>
                      <li>• <span className="text-orange-400">50-74:</span> High Risk 🚫</li>
                      <li>• <span className="text-red-400">75-100:</span> Critical Risk 🔴</li>
                    </ul>
                  </div>
                  <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="font-semibold text-blue-400 mb-2">✅ Readiness Score (0-100)</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• <span className="text-red-400">0-24:</span> Not Ready</li>
                      <li>• <span className="text-yellow-400">25-49:</span> Needs Work</li>
                      <li>• <span className="text-blue-400">50-74:</span> Mostly Ready</li>
                      <li>• <span className="text-green-400">75-100:</span> Production Ready</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/50">
                <span className="text-green-400 font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Execute the Plan</h3>
                <p className="text-gray-400 mb-3">If the risk score is below 50, click "Execute Plan". SafeRun will:</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    Create an isolated Daytona workspace
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    Clone the repository
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    Execute steps sequentially (install → build → run)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    Expose ports if it's a web application
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    Stream logs in real-time
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-300 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span><strong>Automatic Blocking:</strong> Repositories with High or Critical risk (score ≥ 50) cannot be executed.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/50">
                <span className="text-cyan-400 font-bold">5</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Monitor Execution</h3>
                <p className="text-gray-400 mb-3">Watch real-time logs and get results:</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    Color-coded logs (info, success, error)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    Step-by-step execution progress
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    Preview URL for web applications
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    Final status (success/failed)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">🔒</span>
            Security Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-950/70 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">PromptShield Scanner</h3>
              <p className="text-gray-400 mb-4">30+ regex-based detection rules for:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• API keys and secrets</li>
                <li>• Data exfiltration patterns</li>
                <li>• Dangerous system commands</li>
                <li>• Prompt injection attempts</li>
                <li>• PII (Personal Identifiable Information)</li>
              </ul>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-xl font-semibold text-purple-400 mb-3">AI Security Analysis</h3>
              <p className="text-gray-400 mb-4">Claude 3.5 Sonnet analyzes:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Contextual threat assessment</li>
                <li>• Operational readiness</li>
                <li>• Risk categorization</li>
                <li>• Actionable recommendations</li>
                <li>• Safer alternatives for risky code</li>
              </ul>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Execution Constraints</h3>
              <p className="text-gray-400 mb-4">Runtime protection:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• No raw shell commands (only 4 verbs)</li>
                <li>• Non-root execution</li>
                <li>• Memory limits (2GB default)</li>
                <li>• Network egress allowlist</li>
                <li>• 30-minute timeout</li>
              </ul>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Isolated Workspaces</h3>
              <p className="text-gray-400 mb-4">Daytona containers provide:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Complete isolation per execution</li>
                <li>• Automatic cleanup</li>
                <li>• Resource limits</li>
                <li>• Secure networking</li>
                <li>• No cross-contamination</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Supported Languages */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">💻</span>
            Supported Languages & Frameworks
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { lang: 'Node.js/TypeScript', tools: ['npm', 'pnpm', 'yarn'], frameworks: ['Next.js', 'Remix', 'Express'] },
              { lang: 'Python', tools: ['pip', 'poetry'], frameworks: ['Flask', 'Django', 'FastAPI'] },
              { lang: 'Rust', tools: ['cargo'], frameworks: ['Actix', 'Rocket'] },
              { lang: 'Go', tools: ['go mod'], frameworks: ['Gin', 'Echo'] },
              { lang: 'Java', tools: ['maven', 'gradle'], frameworks: ['Spring Boot'] },
              { lang: 'Ruby', tools: ['bundler'], frameworks: ['Rails', 'Sinatra'] },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-950/70 rounded-xl p-4 border border-slate-700/30">
                <h3 className="font-semibold text-gray-200 mb-2">{item.lang}</h3>
                <p className="text-sm text-gray-400 mb-2">Tools: {item.tools.join(', ')}</p>
                <p className="text-xs text-gray-500">Frameworks: {item.frameworks.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">❓</span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'What happens if my repository has a high risk score?',
                a: 'Repositories with a risk score of 50 or higher are automatically blocked from execution. You can review the security analysis to understand the threats detected and make necessary changes to your code.'
              },
              {
                q: 'How long does execution take?',
                a: 'Execution time varies by project size and complexity. Simple projects may complete in 1-2 minutes, while larger projects can take up to 30 minutes (the maximum timeout).'
              },
              {
                q: 'Can I execute private repositories?',
                a: 'Currently, SafeRun only supports public GitHub repositories. Private repository support may be added in future versions.'
              },
              {
                q: 'What are the 4 allowed verbs?',
                a: 'SafeRun only allows: install (dependencies), build (compile/bundle), run (start application), and test (run tests). This prevents arbitrary shell command execution.'
              },
              {
                q: 'How is my code isolated?',
                a: 'Each execution runs in a separate Daytona container with resource limits, network restrictions, and automatic cleanup. Containers are destroyed after execution.'
              },
              {
                q: 'What if execution fails?',
                a: 'Check the execution logs for error messages. Common issues include missing dependencies, incorrect build commands, or port conflicts. The workspace is automatically cleaned up on failure.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-950/70 rounded-xl p-6 border border-slate-700/30">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to SafeRun
          </a>
        </div>
      </div>
    </main>
  );
}
