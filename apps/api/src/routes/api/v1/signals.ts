import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { signalLifecycleService, scoringOrchestrator } from '@meme-coin/core';
import { Decision } from '@meme-coin/types';

export const signalRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/signals - List paginated signals
  fastify.get('/', async (request, reply) => {
    const query = request.query as {
      decision?: Decision;
      status?: 'ACTIVE' | 'RESOLVED' | 'EXPIRED' | 'CANCELLED';
      tokenId?: string;
      limit?: string;
      offset?: string;
    };

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    const result = await signalLifecycleService.getSignals({
      decision: query.decision,
      status: query.status,
      tokenId: query.tokenId,
      limit,
      offset,
    });

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  });

  // GET /api/v1/signals/stats - Signal aggregates
  fastify.get('/stats', async (_request, reply) => {
    const stats = await signalLifecycleService.getSignalStats();
    return reply.status(200).send({
      success: true,
      data: stats,
    });
  });

  // GET /api/v1/signals/:id - Get single signal details
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const signal = await signalLifecycleService.getSignalById(id);

    if (!signal) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SIGNAL_NOT_FOUND', message: `Signal with ID ${id} not found` },
      });
    }

    return reply.status(200).send({
      success: true,
      data: signal,
    });
  });

  // POST /api/v1/signals/evaluate - On-demand evaluation and signal generation
  fastify.post('/evaluate', async (request, reply) => {
    const body = request.body as {
      tokenId: string;
      features: any;
      dataQualityScore?: number;
      tradeSampleCount?: number;
    };

    if (!body.tokenId || !body.features) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'tokenId and features are required' },
      });
    }

    const output = await scoringOrchestrator.scoreToken({
      tokenId: body.tokenId,
      features: body.features,
      dataQualityScore: body.dataQualityScore,
      tradeSampleCount: body.tradeSampleCount,
    });

    return reply.status(200).send({
      success: true,
      data: output,
    });
  });
};
