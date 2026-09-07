import { FastifyInstance } from 'fastify';
import { prisma } from '@meme-coin/database';

export async function scoreRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/scores/:tokenId - Get historical score snapshots for a token
  app.get('/:tokenId', async (req, reply) => {
    const { tokenId } = req.params as { tokenId: string };
    const query = req.query as { limit?: string; version?: string };
    const limit = Math.min(Number(query.limit ?? 50), 100);

    const scoreSnapshots = await prisma.scoreSnapshot.findMany({
      where: {
        tokenId,
        ...(query.version ? { scoringVersion: query.version } : {}),
      },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        signals: true,
      },
    });

    return reply.send({
      success: true,
      data: scoreSnapshots,
    });
  });
}
