import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { defaultLogger } from '@meme-coin/utils';
import { healthRoutes } from './routes/health.js';
import { systemRoutes } from './routes/api/v1/system.js';
import { tokenRoutes } from './routes/api/v1/tokens.js';
import { signalRoutes } from './routes/api/v1/signals.js';
import { snapshotRoutes } from './routes/api/v1/snapshots.js';
import { featureRoutes } from './routes/api/v1/features.js';
import { scoreRoutes } from './routes/api/v1/scores.js';
import { alertsRoutes } from './routes/api/v1/alerts.js';
import { outcomeRoutes } from './routes/api/v1/outcomes.js';
import { paperTradingRoutes } from './routes/api/v1/paper-trading.js';
import { backtestRoutes } from './routes/api/v1/backtest.js';
import { narrativeRoutes } from './routes/api/v1/narratives.js';
import { socialRoutes } from './routes/api/v1/social.js';

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Using our centralized Pino logger
    trustProxy: true,
  });

  // Core Security & Utilities
  await app.register(sensible);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // Request Logging
  app.addHook('onRequest', async (req) => {
    defaultLogger.debug({ method: req.method, url: req.url }, 'Incoming request');
  });

  // Global Error Handler
  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    defaultLogger.error({ err: error, url: request.url }, 'Unhandled API Error');
    const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    const code = 'code' in error && typeof error.code === 'string' ? error.code : 'INTERNAL_SERVER_ERROR';

    reply.status(statusCode).send({
      success: false,
      error: {
        code,
        message: error.message,
      },
    });
  });

  // Register Routes
  await app.register(healthRoutes);
  await app.register(systemRoutes, { prefix: '/api/v1/system' });
  await app.register(tokenRoutes, { prefix: '/api/v1/tokens' });
  await app.register(signalRoutes, { prefix: '/api/v1/signals' });
  await app.register(snapshotRoutes, { prefix: '/api/v1/snapshots' });
  await app.register(featureRoutes, { prefix: '/api/v1/features' });
  await app.register(scoreRoutes, { prefix: '/api/v1/scores' });
  await app.register(alertsRoutes, { prefix: '/api/v1/alerts' });
  await app.register(outcomeRoutes, { prefix: '/api/v1/outcomes' });
  await app.register(paperTradingRoutes, { prefix: '/api/v1/paper-trading' });
  await app.register(backtestRoutes, { prefix: '/api/v1/backtest' });
  await app.register(narrativeRoutes, { prefix: '/api/v1/narratives' });
  await app.register(socialRoutes, { prefix: '/api/v1/social' });

  return app;
}
