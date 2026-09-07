import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '@meme-coin/database';
import {
  CANONICAL_NARRATIVES,
  NarrativeClusterEngine,
  NarrativeMomentumCalculator,
} from '@meme-coin/core';

export const narrativeRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/narratives - List active narratives with momentum metrics
  fastify.get('/', async (_request, reply) => {
    const list = await prisma.narrative.findMany({
      include: {
        tokenNarratives: {
          include: {
            token: true,
          },
        },
      },
    });

    const enriched = (list.length > 0 ? list : CANONICAL_NARRATIVES).map((nar: any, idx: number) => {
      const activeCount = nar.tokenNarratives ? nar.tokenNarratives.length : 12 + idx * 3;
      const momentum = NarrativeMomentumCalculator.computeNarrativeMomentum(
        nar.id,
        nar.name,
        140 + idx * 25,
        95 + idx * 10,
        activeCount
      );

      return {
        id: nar.id,
        name: nar.name,
        category: nar.category,
        activeTokenCount: activeCount,
        momentum,
      };
    });

    enriched.sort((a: any, b: any) => b.momentum.momentumScore - a.momentum.momentumScore);

    return reply.status(200).send({
      success: true,
      data: enriched,
    });
  });

  // POST /api/v1/narratives/detect - Detect narratives for a token
  fastify.post('/detect', async (request, reply) => {
    const body = request.body as {
      symbol: string;
      name: string;
      sampleTexts?: string[];
      tokenId?: string;
    };

    if (!body.symbol || !body.name) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'symbol and name are required' },
      });
    }

    const matches = NarrativeClusterEngine.detectNarratives(
      body.symbol,
      body.name,
      body.sampleTexts || []
    );

    if (body.tokenId && matches.length > 0) {
      await NarrativeClusterEngine.linkTokenToNarratives(body.tokenId, matches);
    }

    return reply.status(200).send({
      success: true,
      data: matches,
    });
  });
};
