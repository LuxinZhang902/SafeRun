"use strict";
/**
 * PromptShield - Security scanning rules for repository analysis
 * Detects secrets, data exfiltration, system commands, prompt injection, and PII
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanRepository = scanRepository;
exports.getRiskLevel = getRiskLevel;
exports.shouldBlockExecution = shouldBlockExecution;
const SECURITY_RULES = [
    // Secrets Detection
    {
        name: 'Anthropic API Key',
        category: 'Secrets',
        pattern: /sk-ant-[a-zA-Z0-9_-]{95,}/gi,
        severity: 'critical',
        weight: 25,
    },
    {
        name: 'GitHub Token',
        category: 'Secrets',
        pattern: /ghp_[a-zA-Z0-9]{36,}/gi,
        severity: 'critical',
        weight: 25,
    },
    {
        name: 'AWS Access Key',
        category: 'Secrets',
        pattern: /AKIA[0-9A-Z]{16}/gi,
        severity: 'critical',
        weight: 25,
    },
    {
        name: 'JWT Token',
        category: 'Secrets',
        pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/gi,
        severity: 'high',
        weight: 20,
    },
    {
        name: 'Generic API Key',
        category: 'Secrets',
        pattern: /api[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Private Key',
        category: 'Secrets',
        pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/gi,
        severity: 'critical',
        weight: 30,
    },
    // Data Exfiltration
    {
        name: 'HTTP Upload',
        category: 'Data Exfiltration',
        pattern: /\b(upload|post|send)\s+.*\s+(http|https):\/\//gi,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Webhook Call',
        category: 'Data Exfiltration',
        pattern: /webhook|discord\.com\/api\/webhooks|slack\.com\/api\/chat/gi,
        severity: 'medium',
        weight: 10,
    },
    {
        name: 'Cloud Storage Upload',
        category: 'Data Exfiltration',
        pattern: /\b(s3|drive|dropbox|onedrive)\.upload|aws\s+s3\s+cp/gi,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Curl POST Data',
        category: 'Data Exfiltration',
        pattern: /curl\s+.*(-d|--data|--data-binary)/gi,
        severity: 'medium',
        weight: 10,
    },
    {
        name: 'Base64 Encode',
        category: 'Data Exfiltration',
        pattern: /base64\s+-w\s*0|btoa\(|Buffer\.from\(.*\)\.toString\(['"]base64['"]\)/gi,
        severity: 'low',
        weight: 5,
    },
    // System Commands
    {
        name: 'Recursive Delete',
        category: 'System Commands',
        pattern: /rm\s+-rf\s+\/|rm\s+-rf\s+\*|del\s+\/s\s+\/q/gi,
        severity: 'critical',
        weight: 30,
    },
    {
        name: 'Sudo Execution',
        category: 'System Commands',
        pattern: /sudo\s+/gi,
        severity: 'high',
        weight: 20,
    },
    {
        name: 'Dangerous Permissions',
        category: 'System Commands',
        pattern: /chmod\s+(777|666)|chown\s+root/gi,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Pipe to Shell',
        category: 'System Commands',
        pattern: /curl\s+.*\|\s*(bash|sh|zsh)|wget\s+.*\|\s*(bash|sh)/gi,
        severity: 'critical',
        weight: 30,
    },
    {
        name: 'Eval Execution',
        category: 'System Commands',
        pattern: /\beval\s*\(|exec\s*\(|system\s*\(/gi,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Process Spawn',
        category: 'System Commands',
        pattern: /child_process\.(exec|spawn|execSync)|subprocess\.(run|Popen|call)/gi,
        severity: 'medium',
        weight: 8,
    },
    // Prompt Injection
    {
        name: 'Ignore Instructions',
        category: 'Prompt Injection',
        pattern: /ignore\s+(previous|all|above)\s+(instructions|prompts|rules)/gi,
        severity: 'high',
        weight: 20,
    },
    {
        name: 'Jailbreak Attempt',
        category: 'Prompt Injection',
        pattern: /jailbreak|DAN\s+mode|developer\s+mode\s+enabled/gi,
        severity: 'high',
        weight: 20,
    },
    {
        name: 'Role Play Attack',
        category: 'Prompt Injection',
        pattern: /act\s+as\s+(a\s+)?(hacker|admin|root|system)/gi,
        severity: 'medium',
        weight: 10,
    },
    {
        name: 'System Prompt Override',
        category: 'Prompt Injection',
        pattern: /new\s+system\s+prompt|override\s+system|reset\s+instructions/gi,
        severity: 'high',
        weight: 15,
    },
    // PII Detection
    {
        name: 'Social Security Number',
        category: 'PII',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Credit Card',
        category: 'PII',
        pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Email Address',
        category: 'PII',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        severity: 'low',
        weight: 3,
    },
    {
        name: 'Passport Number',
        category: 'PII',
        pattern: /passport\s*[:=]\s*[A-Z0-9]{6,}/gi,
        severity: 'high',
        weight: 15,
    },
    {
        name: 'Salary Information',
        category: 'PII',
        pattern: /salary\s*[:=]\s*\$?\d{4,}/gi,
        severity: 'medium',
        weight: 8,
    },
];
/**
 * Scan repository content for security threats
 */
function scanRepository(files) {
    const highlights = [];
    const categoryHits = {};
    let totalScore = 0;
    let totalHits = 0;
    // Scan each file
    for (const [filePath, content] of Object.entries(files)) {
        const lines = content.split('\n');
        for (const rule of SECURITY_RULES) {
            const matches = content.match(rule.pattern);
            if (matches) {
                const hitCount = matches.length;
                totalHits += hitCount;
                categoryHits[rule.category] = (categoryHits[rule.category] || 0) + hitCount;
                // Add to score based on severity and weight
                totalScore += rule.weight * hitCount;
                // Find line numbers for highlights
                for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                    if (rule.pattern.test(lines[lineNum])) {
                        highlights.push({
                            path: filePath,
                            line: lineNum + 1,
                            content: lines[lineNum].trim().substring(0, 100),
                            threat: rule.name,
                            severity: rule.severity,
                        });
                    }
                }
            }
        }
    }
    // Normalize score to 0-100
    const baseScore = Math.min(100, totalScore);
    // Calculate category percentages
    const categories = Object.entries(categoryHits).map(([name, hits]) => ({
        name,
        pct: Math.round((hits / totalHits) * 100) || 0,
        hits,
    }));
    return {
        baseScore,
        categories,
        highlights: highlights.slice(0, 50), // Limit to top 50 threats
        totalHits,
    };
}
/**
 * Get risk level from score
 */
function getRiskLevel(score) {
    if (score >= 75)
        return 'Critical';
    if (score >= 50)
        return 'High';
    if (score >= 25)
        return 'Medium';
    return 'Low';
}
/**
 * Check if execution should be blocked
 */
function shouldBlockExecution(score) {
    return score >= 50; // Block High and Critical
}
//# sourceMappingURL=rules.js.map