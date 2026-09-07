import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { outcomeTrackerService } from '@meme-coin/core';

export const outcomeRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/outcomes - Query outcomes list
  fastify.get('/', async (request, reply) => {
    const query = request.query as {
      tokenId?: string;
      signalId?: string;
      limit?: string;
    };

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const outcomes = await outcomeTrackerService.getOutcomes({
      tokenId: query.tokenId,
      signalId: query.signalId,
      limit,
    });

    return reply.status(200).send({
      success: true,
      data: outcomes,
    });
  });

  // GET /api/v1/outcomes/stats - Aggregate outcome stats
  fastify.get('/stats', async (_request, reply) => {
    const stats = await outcomeTrackerService.getOutcomeStats();
    return reply.status(200).send({
      success: true,
      data: stats,
    });
  });

  // POST /api/v1/outcomes/track - On-demand outcome calculation for a signal
  fastify.post('/track', async (request, reply) => {
    const body = request.body as { signalId?: string };
    if (!body.signalId) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'signalId is required' },
      });
    }

    const outcome = await outcomeTrackerService.trackSignalOutcome(body.signalId);
    if (!outcome) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SIGNAL_NOT_FOUND', message: `Signal ${body.signalId} not found` },
      });
    }

    return reply.status(200).send({
      success: true,
      data: outcome,
    });
  });
};
