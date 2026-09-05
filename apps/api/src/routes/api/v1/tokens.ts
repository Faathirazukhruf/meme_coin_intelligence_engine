import { FastifyInstance } from 'fastify';
import { prisma } from '@meme-coin/database';

export async function tokenRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/tokens - List discovered tokens
  app.get('/', async (req, reply) => {
    const query = req.query as { limit?: string; offset?: string; status?: string };
    const limit = Math.min(Number(query.limit ?? 50), 100);
    const offset = Math.max(Number(query.offset ?? 0), 0);

    const tokens = await prisma.token.findMany({
      where: query.status ? { status: query.status } : undefined,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        pools: true,
      },
    });

    const total = await prisma.token.count({
      where: query.status ? { status: query.status } : undefined,
    });

    return reply.send({
      success: true,
      data: tokens,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  });

  // GET /api/v1/tokens/:address - Get token details with latest snapshots & signals
  app.get('/:address', async (req, reply) => {
    const { address } = req.params as { address: string };

    const token = await prisma.token.findUnique({
      where: { address },
      include: {
        pools: true,
        marketSnapshots: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        holderSnapshots: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        scoreSnapshots: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        signals: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!token) {
      return reply.status(404).send({
        success: false,
        error: { code: 'TOKEN_NOT_FOUND', message: `Token with address ${address} not found` },
      });
    }

    return reply.send({
      success: true,
      data: token,
    });
  });
}
