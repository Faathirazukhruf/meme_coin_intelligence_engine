import { FastifyInstance } from 'fastify';
import { prisma } from '@meme-coin/database';

export async function featureRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/features/:tokenId - Get historical feature snapshots for a token
  app.get('/:tokenId', async (req, reply) => {
    const { tokenId } = req.params as { tokenId: string };
    const query = req.query as { limit?: string; version?: string };
    const limit = Math.min(Number(query.limit ?? 50), 100);

    const featureSnapshots = await prisma.featureSnapshot.findMany({
      where: {
        tokenId,
        ...(query.version ? { featureVersion: query.version } : {}),
      },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return reply.send({
      success: true,
      data: featureSnapshots,
    });
  });
}
