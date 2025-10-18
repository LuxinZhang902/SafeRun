"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlan = generatePlan;
exports.summarizeExecution = summarizeExecution;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../config");
const yaml_1 = __importDefault(require("yaml"));
const planSchema_1 = require("./planSchema");
const anthropic = new sdk_1.default({
    apiKey: config_1.config.anthropicApiKey,
});
const PLAN_GENERATION_PROMPT = `You are an expert DevOps engineer. Given a repository structure and README, generate a deterministic execution plan in YAML format.

The plan must follow this schema:
- version: "1.0"
- name: string (project name)
- runtime: string (e.g., "node:20", "python:3.11")
- steps: array of:
  - name: string
  - verb: "install" | "build" | "run" | "test"
  - args: string[] (optional, additional arguments)
  - env: object (optional, environment variables)
  - workdir: string (optional, working directory)
  - timeout: number (optional, milliseconds)
- ports: number[] (optional, ports to expose)
- healthcheck: string (optional, URL path to check)

Rules:
1. Use ONLY the four verbs: install, build, run, test
2. No raw shell commands - the executor will map verbs to appropriate commands
3. For Node.js: install → npm/pnpm install, build → npm run build, run → npm start
4. For Python: install → pip install, run → python main.py
5. Include reasonable timeouts (install: 5min, build: 10min, run: indefinite)
6. Detect ports from package.json scripts or common patterns
7. Be deterministic - same repo should produce same plan

Return ONLY valid YAML, no markdown formatting.`;
async function generatePlan(repoContext) {
    const contextText = `
Repository: ${repoContext.url}

${repoContext.analysis ? `
Detected Language: ${repoContext.analysis.primaryLanguage}
Detected Runtime: ${repoContext.analysis.runtime}
Detected Ports: ${repoContext.analysis.ports.join(', ')}
${repoContext.analysis.installCommand ? `Install Command: ${repoContext.analysis.installCommand}` : ''}
${repoContext.analysis.buildCommand ? `Build Command: ${repoContext.analysis.buildCommand}` : ''}
${repoContext.analysis.runCommand ? `Run Command: ${repoContext.analysis.runCommand}` : ''}
${repoContext.analysis.testCommand ? `Test Command: ${repoContext.analysis.testCommand}` : ''}
` : ''}

${repoContext.structure ? `
Structure:
- Has Dockerfile: ${repoContext.structure.hasDockerfile}
- Has Procfile: ${repoContext.structure.hasProcfile}
- Has DevContainer: ${repoContext.structure.hasDevContainer}
- Has .env.example: ${repoContext.structure.hasEnvExample}
- Languages: ${repoContext.structure.languages.join(', ')}
` : ''}

README (Summary):
${repoContext.readme.substring(0, 2000)}${repoContext.readme.length > 2000 ? '...' : ''}

Key Manifests:
${Object.entries(repoContext.manifests).map(([name, content]) => `
--- ${name} (${content.length} bytes) ---
${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
`).join('\n')}
`;
    const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
            {
                role: 'user',
                content: `${PLAN_GENERATION_PROMPT}\n\n${contextText}`,
            },
        ],
    });
    const content = message.content[0];
    if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
    }
    const yamlText = content.text.trim();
    const parsed = yaml_1.default.parse(yamlText);
    return (0, planSchema_1.validatePlan)(parsed);
}
async function summarizeExecution(logs) {
    const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: `Summarize this execution log in 2-3 sentences. Focus on success/failure and key issues:\n\n${logs.join('\n')}`,
            },
        ],
    });
    const content = message.content[0];
    if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
    }
    return content.text.trim();
}
//# sourceMappingURL=llm.js.map