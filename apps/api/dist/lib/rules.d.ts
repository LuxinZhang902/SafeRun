/**
 * PromptShield - Security scanning rules for repository analysis
 * Detects secrets, data exfiltration, system commands, prompt injection, and PII
 */
export interface SecurityScanResult {
    baseScore: number;
    categories: Array<{
        name: string;
        pct: number;
        hits: number;
    }>;
    highlights: Array<{
        path: string;
        line: number;
        content: string;
        threat: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    totalHits: number;
}
/**
 * Scan repository content for security threats
 */
export declare function scanRepository(files: Record<string, string>): SecurityScanResult;
/**
 * Get risk level from score
 */
export declare function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical';
/**
 * Check if execution should be blocked
 */
export declare function shouldBlockExecution(score: number): boolean;
//# sourceMappingURL=rules.d.ts.map