import { type Plan } from './planSchema';
export declare function generatePlan(repoContext: {
    url: string;
    readme: string;
    manifests: Record<string, string>;
    structure?: {
        hasDockerfile: boolean;
        hasProcfile: boolean;
        hasDevContainer: boolean;
        hasEnvExample: boolean;
        directories: string[];
        languages: string[];
    };
    analysis?: {
        primaryLanguage: string;
        runtime: string;
        buildCommand?: string;
        runCommand?: string;
        testCommand?: string;
        installCommand?: string;
        ports: number[];
        dependencies: Record<string, string>;
    };
}): Promise<Plan>;
export declare function summarizeExecution(logs: string[]): Promise<string>;
//# sourceMappingURL=llm.d.ts.map