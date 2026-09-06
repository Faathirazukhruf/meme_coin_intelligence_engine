import { FastifyInstance } from 'fastify';
import { prisma } from '@meme-coin/database';

export async function snapshotRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/snapshots/market/:tokenId - Get historical market snapshots for a token
  app.get('/market/:tokenId', async (req, reply) => {
    const { tokenId } = req.params as { tokenId: string };
    const query = req.query as { limit?: string };
    const limit = Math.min(Number(query.limit ?? 50), 100);

    const snapshots = await prisma.marketSnapshot.findMany({
      where: { tokenId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return reply.send({
      success: true,
      data: snapshots,
    });
  });

  // GET /api/v1/snapshots/holder/:tokenId - Get historical holder snapshots
  app.get('/holder/:tokenId', async (req, reply) => {
    const { tokenId } = req.params as { tokenId: string };
    const query = req.query as { limit?: string };
    const limit = Math.min(Number(query.limit ?? 50), 100);

    const snapshots = await prisma.holderSnapshot.findMany({
      where: { tokenId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return reply.send({
      success: true,
      data: snapshots,
    });
  });
}
