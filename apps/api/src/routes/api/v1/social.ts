import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '@meme-coin/database';
import {
  socialEventIngester,
  SocialVelocityCalculator,
  NarrativeClusterEngine,
  NarrativeSummarizer,
} from '@meme-coin/core';

export const socialRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/v1/social/events - Ingest batch social events
  fastify.post('/events', async (request, reply) => {
    const body = request.body as {
      events?: any[];
    };

    if (!body.events || !Array.isArray(body.events)) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'events array is required' },
      });
    }

    const formatted = body.events.map((e) => ({
      tokenId: e.tokenId,
      platform: e.platform || 'X',
      authorId: e.authorId,
      eventType: e.eventType || 'POST',
      content: e.content,
      createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      engagement: e.engagement || 0,
      followers: e.followers || 0,
    }));

    const result = await socialEventIngester.ingestBatch(formatted);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  // GET /api/v1/social/:tokenId - Get social metrics & narrative summary for a token
  fastify.get('/:tokenId', async (request, reply) => {
    const { tokenId } = request.params as { tokenId: string };

    const token = await prisma.token.findUnique({
      where: { id: tokenId },
    });

    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // last 30 minutes
    const events = await prisma.socialEvent.findMany({
      where: {
        tokenId,
        createdAt: { gte: cutoff },
      },
      take: 200,
    });

    const velocity = SocialVelocityCalculator.computeVelocity(
      (events as any[]).map((e) => ({
        authorId: e.authorId,
        createdAt: e.createdAt,
        engagement: e.engagement,
      })),
      30
    );

    const narratives = NarrativeClusterEngine.detectNarratives(
      token?.symbol || 'TOKEN',
      token?.name || 'Meme Token',
      (events as any[]).map((e) => e.contentHash)
    );

    const summary = NarrativeSummarizer.generateSummary(
      token?.symbol || 'TOKEN',
      narratives,
      velocity
    );

    return reply.status(200).send({
      success: true,
      data: {
        tokenId,
        symbol: token?.symbol || 'TOKEN',
        velocity,
        narratives,
        summary,
      },
    });
  });
};
