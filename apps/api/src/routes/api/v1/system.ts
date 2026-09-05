import { FastifyInstance } from 'fastify';
import { getConfig } from '@meme-coin/config';

export async function systemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/info', async (_req, reply) => {
    const config = getConfig();
    return reply.send({
      name: 'Meme Coin Intelligence Engine',
      environment: config.NODE_ENV,
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
    });
  });
}
