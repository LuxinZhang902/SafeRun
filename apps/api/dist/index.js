"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const config_1 = require("./config");
const plan_1 = require("./routes/plan");
const execute_1 = require("./routes/execute");
const run_1 = require("./routes/run");
const fastify = (0, fastify_1.default)({
    logger: {
        level: config_1.config.nodeEnv === 'development' ? 'info' : 'warn',
    },
});
async function start() {
    try {
        // Register CORS
        await fastify.register(cors_1.default, {
            origin: config_1.config.nodeEnv === 'development' ? '*' : false,
        });
        // Health check
        fastify.get('/health', async () => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });
        // Register routes
        await fastify.register(plan_1.planRoutes);
        await fastify.register(execute_1.executeRoutes);
        await fastify.register(run_1.runRoutes);
        // Start server
        await fastify.listen({
            port: config_1.config.port,
            host: '0.0.0.0',
        });
        console.log(`🚀 Initium API server running on http://localhost:${config_1.config.port}`);
        console.log(`📊 Health check: http://localhost:${config_1.config.port}/health`);
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map