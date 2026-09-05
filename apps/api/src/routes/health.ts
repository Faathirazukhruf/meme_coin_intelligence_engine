import { FastifyInstance } from 'fastify';
import { checkDatabaseHealth } from '@meme-coin/database';
import { getConfig } from '@meme-coin/config';
import Redis from 'ioredis';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_req, reply) => {
    const config = getConfig();
    const dbHealth = await checkDatabaseHealth();

    let redisHealthy = false;
    let redisLatencyMs = 0;
    try {
      const redisStart = Date.now();
      const redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
      await redis.connect();
      const pong = await redis.ping();
      redisLatencyMs = Date.now() - redisStart;
      redisHealthy = pong === 'PONG';
      await redis.quit();
    } catch {
      redisHealthy = false;
    }

    const overallHealthy = dbHealth.healthy && redisHealthy;
    const statusCode = overallHealthy ? 200 : 503;

    return reply.status(statusCode).send({
      status: overallHealthy ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      version: config.CODE_VERSION,
      versions: {
        datasetVersion: config.DATASET_VERSION,
        parserVersion: config.PARSER_VERSION,
        featureVersion: config.FEATURE_VERSION,
        riskVersion: config.RISK_VERSION,
        opportunityVersion: config.OPPORTUNITY_VERSION,
        scoringVersion: config.SCORING_VERSION,
        decisionVersion: config.DECISION_VERSION,
        strategyVersion: config.STRATEGY_VERSION,
        codeVersion: config.CODE_VERSION,
      },
      services: {
        database: {
          status: dbHealth.healthy ? 'HEALTHY' : 'DOWN',
          latencyMs: dbHealth.latencyMs,
          error: dbHealth.error,
        },
        redis: {
          status: redisHealthy ? 'HEALTHY' : 'DOWN',
          latencyMs: redisLatencyMs,
        },
      },
    });
  });
}
