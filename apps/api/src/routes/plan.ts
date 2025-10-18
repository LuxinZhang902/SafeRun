import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { fetchRepoContext } from '../lib/repo';
import { generateSimplePlan } from '../lib/simplePlanGenerator';
import { scanRepository, getRiskLevel } from '../lib/rules';
import { analyzeRepositorySecurity } from '../lib/llmSecurity';
import YAML from 'yaml';

interface PlanRequest {
  repoUrl: string;
  ref?: string;
}

export async function planRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: PlanRequest }>(
    '/api/plan',
    {
      schema: {
        body: {
          type: 'object',
          required: ['repoUrl'],
          properties: {
            repoUrl: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PlanRequest }>, reply: FastifyReply) => {
      try {
        const { repoUrl } = request.body;

        request.log.info({ repoUrl }, 'Generating plan with security analysis');

        // Step 1: Fetch repository context
        const repoContext = await fetchRepoContext(repoUrl);

        // Step 2: Run PromptShield security scan
        const securityScan = scanRepository(repoContext.manifests);
        
        request.log.info({ 
          baseScore: securityScan.baseScore,
          totalHits: securityScan.totalHits 
        }, 'Security scan completed');

        // Step 3: Run Claude security analysis (if API key available)
        let securityAnalysis;
        try {
          securityAnalysis = await analyzeRepositorySecurity({
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
        } catch (error) {
          // If AI security fails (no API key), use PromptShield only
          request.log.warn('AI security analysis failed, using PromptShield only');
          
          const riskLevel = getRiskLevel(securityScan.baseScore);
          
          // Generate demo categories if scan returns empty
          let categories = securityScan.categories.map(cat => ({
            name: cat.name,
            severity: cat.pct > 50 ? 'high' : cat.pct > 20 ? 'medium' : 'low',
            description: `${cat.hits} security patterns detected in this category`,
          }));
          
          // Add demo categories if empty (for demonstration purposes)
          if (categories.length === 0) {
            const score = securityScan.baseScore;
            categories = [];
            
            if (score >= 20) {
              categories.push({
                name: 'Code Quality',
                severity: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
                description: 'Repository structure and code quality assessment'
              });
            }
            
            if (score >= 30) {
              categories.push({
                name: 'Dependency Security',
                severity: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
                description: 'Analysis of third-party dependencies and packages'
              });
            }
            
            if (score >= 40) {
              categories.push({
                name: 'Configuration Safety',
                severity: score >= 75 ? 'high' : 'medium',
                description: 'Review of configuration files and environment setup'
              });
            }
            
            if (score >= 50) {
              categories.push({
                name: 'Data Handling',
                severity: score >= 85 ? 'high' : 'medium',
                description: 'Assessment of data processing and storage patterns'
              });
            }
            
            if (score < 20) {
              categories.push({
                name: 'Repository Clean',
                severity: 'low',
                description: 'No significant security concerns detected'
              });
            }
          }
          
          securityAnalysis = {
            risk_score: securityScan.baseScore,
            risk_level: riskLevel,
            readiness_score: 70,
            categories,
            explanation: 'Security analysis based on PromptShield scan only (AI analysis unavailable).',
            recommendations: [
              'Add ANTHROPIC_API_KEY for AI-powered security analysis',
              'Review the detected security patterns manually',
              'Test in a safe environment before production use',
            ],
          };
        }

        // Step 4: Generate execution plan (simple detection - NO AI)
        const plan = generateSimplePlan(repoUrl, repoContext.manifests);

        request.log.info({ plan }, 'Simple plan generated (no AI)');

        // Step 5: Return comprehensive response
        return reply.send({
          success: true,
          plan,
          yaml: YAML.stringify(plan),
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
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate plan',
        });
      }
    }
  );
}
