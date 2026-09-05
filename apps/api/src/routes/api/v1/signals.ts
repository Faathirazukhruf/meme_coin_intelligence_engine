import { FastifyInstance } from 'fastify';
import { prisma } from '@meme-coin/database';

export async function signalRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/signals - List signals
  app.get('/', async (req, reply) => {
    const query = req.query as { limit?: string; decision?: string; status?: string };
    const limit = Math.min(Number(query.limit ?? 50), 100);

    const signals = await prisma.signal.findMany({
      where: {
        ...(query.decision ? { decision: query.decision } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        token: true,
        scoreSnapshot: true,
        outcomes: true,
      },
    });

    return reply.send({
      success: true,
      data: signals,
    });
  });
}
