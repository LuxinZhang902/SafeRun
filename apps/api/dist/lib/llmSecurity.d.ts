import { type SecurityScanResult } from './rules';
export interface SecurityAnalysisResult {
    risk_score: number;
    risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
    categories: Array<{
        name: string;
        severity: string;
        description: string;
    }>;
    explanation: string;
    saferRewrite?: string;
    readiness_score: number;
    recommendations: string[];
}
export declare function analyzeRepositorySecurity(params: {
    repoUrl: string;
    readme: string;
    manifests: Record<string, string>;
    structure?: {
        languages: string[];
        hasDockerfile: boolean;
        hasEnvExample: boolean;
    };
    analysis?: {
        primaryLanguage: string;
        runtime: string;
        buildCommand?: string;
        runCommand?: string;
        dependencies: Record<string, string>;
    };
    securityScan: SecurityScanResult;
}): Promise<SecurityAnalysisResult>;
//# sourceMappingURL=llmSecurity.d.ts.map