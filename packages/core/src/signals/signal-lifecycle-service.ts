import { prisma } from '@meme-coin/database';
import { Decision } from '@meme-coin/types';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('signal-lifecycle-service');

export interface SignalQueryFilters {
  decision?: Decision;
  status?: 'ACTIVE' | 'RESOLVED' | 'EXPIRED' | 'CANCELLED';
  tokenId?: string;
  limit?: number;
  offset?: number;
}

export class SignalLifecycleService {
  /**
   * Retrieves paginated signals with optional filters.
   */
  async getSignals(filters: SignalQueryFilters = {}) {
    const { decision, status, tokenId, limit = 50, offset = 0 } = filters;

    const where: Record<string, unknown> = {};
    if (decision) where.decision = decision;
    if (status) where.status = status;
    if (tokenId) where.tokenId = tokenId;

    const [items, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          token: true,
          scoreSnapshot: true,
        },
      }),
      prisma.signal.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  /**
   * Retrieves single signal with full relationships.
   */
  async getSignalById(id: string) {
    return prisma.signal.findUnique({
      where: { id },
      include: {
        token: true,
        scoreSnapshot: true,
        outcomes: true,
      },
    });
  }

  /**
   * Automatically expires signals that have been ACTIVE for longer than maxAgeMinutes.
   */
  async expireStaleSignals(maxAgeMinutes: number = 120): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

    const result = await prisma.signal.updateMany({
      where: {
        status: 'ACTIVE',
        timestamp: { lt: cutoff },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if (result.count > 0) {
      logger.info({ count: result.count, cutoff }, 'Expired stale active signals');
    }

    return result.count;
  }

  /**
   * Aggregates key signal discovery metrics.
   */
  async getSignalStats() {
    const [total, active, candidateCount, highPriorityCount, alertCount] = await Promise.all([
      prisma.signal.count(),
      prisma.signal.count({ where: { status: 'ACTIVE' } }),
      prisma.signal.count({ where: { decision: 'PAPER_TRADE_CANDIDATE' } }),
      prisma.signal.count({ where: { decision: 'HIGH_PRIORITY' } }),
      prisma.signal.count({ where: { decision: 'ALERT' } }),
    ]);

    return {
      totalSignals: total,
      activeSignals: active,
      candidateCount,
      highPriorityCount,
      alertCount,
    };
  }
}

export const signalLifecycleService = new SignalLifecycleService();
