export interface RepoContext {
    url: string;
    readme: string;
    manifests: Record<string, string>;
    structure: RepoStructure;
    analysis: RepoAnalysis;
}
export interface RepoStructure {
    hasDockerfile: boolean;
    hasProcfile: boolean;
    hasDevContainer: boolean;
    hasEnvExample: boolean;
    directories: string[];
    languages: string[];
}
export interface RepoAnalysis {
    primaryLanguage: string;
    runtime: string;
    buildCommand?: string;
    runCommand?: string;
    testCommand?: string;
    installCommand?: string;
    ports: number[];
    dependencies: Record<string, string>;
}
export declare function fetchRepoContext(repoUrl: string): Promise<RepoContext>;
//# sourceMappingURL=repo.d.ts.map