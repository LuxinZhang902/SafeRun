"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.planRoutes = planRoutes;
const repo_1 = require("../lib/repo");
const llm_1 = require("../lib/llm");
const rules_1 = require("../lib/rules");
const llmSecurity_1 = require("../lib/llmSecurity");
const yaml_1 = __importDefault(require("yaml"));
async function planRoutes(fastify) {
    fastify.post('/api/plan', {
        schema: {
            body: {
                type: 'object',
                required: ['repoUrl'],
                properties: {
                    repoUrl: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { repoUrl } = request.body;
            request.log.info({ repoUrl }, 'Generating plan with security analysis');
            // Step 1: Fetch repository context
            const repoContext = await (0, repo_1.fetchRepoContext)(repoUrl);
            // Step 2: Run PromptShield security scan
            const securityScan = (0, rules_1.scanRepository)(repoContext.manifests);
            request.log.info({
                baseScore: securityScan.baseScore,
                totalHits: securityScan.totalHits
            }, 'Security scan completed');
            // Step 3: Run Claude security analysis
            const securityAnalysis = await (0, llmSecurity_1.analyzeRepositorySecurity)({
                repoUrl,
                readme: repoContext.readme,
                manifests: repoContext.manifests,
                structure: repoContext.structure,
                analysis: repoContext.analysis,
                securityScan,
            });
            request.log.info({
                riskScore: securityAnalysis.risk_score,
                riskLevel: securityAnalysis.risk_level,
                readinessScore: securityAnalysis.readiness_score,
            }, 'Security analysis completed');
            // Step 4: Generate execution plan using Claude
            const plan = await (0, llm_1.generatePlan)(repoContext);
            // Step 5: Return comprehensive response
            return reply.send({
                success: true,
                plan,
                yaml: yaml_1.default.stringify(plan),
                security: {
                    risk_score: securityAnalysis.risk_score,
                    risk_level: securityAnalysis.risk_level,
                    readiness_score: securityAnalysis.readiness_score,
                    categories: securityAnalysis.categories,
                    explanation: securityAnalysis.explanation,
                    recommendations: securityAnalysis.recommendations,
                    promptshield: {
                        baseScore: securityScan.baseScore,
                        categories: securityScan.categories,
                        highlights: securityScan.highlights.slice(0, 20), // Top 20 threats
                    },
                },
                detected: {
                    language: repoContext.analysis?.primaryLanguage,
                    runtime: repoContext.analysis?.runtime,
                    ports: repoContext.analysis?.ports,
                    buildCommand: repoContext.analysis?.buildCommand,
                    runCommand: repoContext.analysis?.runCommand,
                },
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate plan',
            });
        }
    });
}
//# sourceMappingURL=plan.js.map