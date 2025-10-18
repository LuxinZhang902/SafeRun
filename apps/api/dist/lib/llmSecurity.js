"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRepositorySecurity = analyzeRepositorySecurity;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../config");
const anthropic = new sdk_1.default({
    apiKey: config_1.config.anthropicApiKey,
});
const SECURITY_ANALYSIS_PROMPT = `You are a DevSecOps and DevOps security expert. Analyze the provided repository for security risks and operational readiness.

Your task:
1. Review the repository structure, README, manifests, and detected security rule violations
2. Assess security risks (secrets, data exfiltration, dangerous commands, prompt injection, PII)
3. Evaluate operational readiness (can this repo be safely executed?)
4. Provide actionable recommendations

Return ONLY valid JSON with this exact structure:
{
  "risk_score": <number 0-100, higher = more dangerous>,
  "risk_level": <"Low" | "Medium" | "High" | "Critical">,
  "categories": [
    {
      "name": "<category name>",
      "severity": "<low|medium|high|critical>",
      "description": "<what was found>"
    }
  ],
  "explanation": "<detailed explanation of risks>",
  "saferRewrite": "<optional: suggest safer alternatives if High/Critical>",
  "readiness_score": <number 0-100, how ready to execute>,
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>"
  ]
}

Security Guidelines:
- Hardcoded secrets = Critical risk
- Data exfiltration patterns = High risk
- Destructive system commands (rm -rf, sudo) = Critical risk
- Prompt injection attempts = High risk
- PII exposure = High risk
- Missing package-lock.json = Medium readiness issue
- No clear entry point = Low readiness
- Well-structured with tests = High readiness

Risk Score Calculation:
- 0-24: Low
- 25-49: Medium
- 50-74: High
- 75-100: Critical

Readiness Score:
- 0-24: Not ready (missing critical files)
- 25-49: Partially ready (needs work)
- 50-74: Mostly ready (minor issues)
- 75-100: Production ready

Return ONLY the JSON, no markdown formatting.`;
async function analyzeRepositorySecurity(params) {
    const contextText = `
Repository: ${params.repoUrl}

Detected Language: ${params.analysis?.primaryLanguage || 'Unknown'}
Runtime: ${params.analysis?.runtime || 'Unknown'}
${params.analysis?.buildCommand ? `Build Command: ${params.analysis.buildCommand}` : ''}
${params.analysis?.runCommand ? `Run Command: ${params.analysis.runCommand}` : ''}

Structure:
- Languages: ${params.structure?.languages.join(', ') || 'Unknown'}
- Has Dockerfile: ${params.structure?.hasDockerfile || false}
- Has .env.example: ${params.structure?.hasEnvExample || false}

Security Scan Results (PromptShield):
- Base Score: ${params.securityScan.baseScore}/100
- Total Threats Found: ${params.securityScan.totalHits}
- Categories:
${params.securityScan.categories.map(c => `  - ${c.name}: ${c.hits} hits (${c.pct}%)`).join('\n')}

Top Threats:
${params.securityScan.highlights.slice(0, 10).map(h => `  - [${h.severity.toUpperCase()}] ${h.threat} in ${h.path}:${h.line}`).join('\n')}

README (Summary):
${params.readme.substring(0, 1500)}${params.readme.length > 1500 ? '...' : ''}

Key Manifests:
${Object.entries(params.manifests).slice(0, 3).map(([name, content]) => `
--- ${name} ---
${content.substring(0, 400)}${content.length > 400 ? '...' : ''}
`).join('\n')}
`;
    const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: SECURITY_ANALYSIS_PROMPT,
        messages: [
            {
                role: 'user',
                content: contextText,
            },
        ],
    });
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    try {
        const result = JSON.parse(responseText);
        // Merge with PromptShield score - take the maximum
        result.risk_score = Math.max(result.risk_score, params.securityScan.baseScore);
        // Update risk level based on final score
        if (result.risk_score >= 75)
            result.risk_level = 'Critical';
        else if (result.risk_score >= 50)
            result.risk_level = 'High';
        else if (result.risk_score >= 25)
            result.risk_level = 'Medium';
        else
            result.risk_level = 'Low';
        return result;
    }
    catch (error) {
        throw new Error(`Failed to parse security analysis: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=llmSecurity.js.map