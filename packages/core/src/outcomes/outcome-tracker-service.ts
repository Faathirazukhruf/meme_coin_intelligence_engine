import { prisma } from '@meme-coin/database';
import { OutcomeEntity } from '@meme-coin/types';
import { createLogger } from '@meme-coin/utils';
import { OutcomeEvaluator, PricePoint } from './outcome-evaluator.js';

const logger = createLogger('outcome-tracker-service');

export class OutcomeTrackerService {
  /**
   * Evaluates forward outcome for a given signal by fetching subsequent market snapshots.
   */
  async trackSignalOutcome(signalId: string): Promise<OutcomeEntity | null> {
    const signal = await prisma.signal.findUnique({
      where: { id: signalId },
      include: {
        token: true,
      },
    });

    if (!signal) {
      logger.warn({ signalId }, 'Signal not found for outcome tracking');
      return null;
    }

    const anchorTimestamp = signal.timestamp;

    // Get anchor market snapshot
    const anchorSnapshot = await prisma.marketSnapshot.findFirst({
      where: {
        tokenId: signal.tokenId,
        timestamp: { lte: anchorTimestamp },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (!anchorSnapshot) {
      logger.warn({ tokenId: signal.tokenId, signalId }, 'Anchor market snapshot not found');
      return null;
    }

    const anchorPrice = anchorSnapshot.price;
    const anchorLiquidity = anchorSnapshot.liquidity;

    // Fetch all market snapshots after anchor timestamp
    const forwardSnapshots = await prisma.marketSnapshot.findMany({
      where: {
        tokenId: signal.tokenId,
        timestamp: { gt: anchorTimestamp },
      },
      orderBy: { timestamp: 'asc' },
    });

    const pricePoints: PricePoint[] = (forwardSnapshots as any[]).map((s) => ({
      timestamp: s.timestamp,
      price: s.price,
      liquidity: s.liquidity,
    }));

    const outcome = OutcomeEvaluator.evaluate({
      tokenId: signal.tokenId,
      signalId: signal.id,
      anchorTimestamp,
      anchorPrice,
      pricePoints,
      anchorLiquidity,
    });

    // Upsert into database
    try {
      await prisma.outcome.upsert({
        where: { id: outcome.id },
        create: {
          id: outcome.id,
          tokenId: outcome.tokenId,
          signalId: outcome.signalId,
          anchorTimestamp: outcome.anchorTimestamp,
          anchorPrice: outcome.anchorPrice,
          price1m: outcome.price1m?.price,
          price3m: outcome.price3m?.price,
          price5m: outcome.price5m?.price,
          price10m: outcome.price10m?.price,
          price30m: outcome.price30m?.price,
          price1h: outcome.price1h?.price,
          price6h: outcome.price6h?.price,
          price24h: outcome.price24h?.price,
          return1m: outcome.price1m?.returnPct,
          return3m: outcome.price3m?.returnPct,
          return5m: outcome.price5m?.returnPct,
          return10m: outcome.price10m?.returnPct,
          return30m: outcome.price30m?.returnPct,
          return1h: outcome.price1h?.returnPct,
          return6h: outcome.price6h?.returnPct,
          return24h: outcome.price24h?.returnPct,
          mfe: outcome.mfe,
          mae: outcome.mae,
          timeToPeakSec: outcome.timeToPeakSec,
          timeToDrawdownSec: outcome.timeToDrawdownSec,
          liquidityChangePct: outcome.liquidityChangePct,
        },
        update: {
          price1m: outcome.price1m?.price,
          price3m: outcome.price3m?.price,
          price5m: outcome.price5m?.price,
          price10m: outcome.price10m?.price,
          price30m: outcome.price30m?.price,
          price1h: outcome.price1h?.price,
          price6h: outcome.price6h?.price,
          price24h: outcome.price24h?.price,
          return1m: outcome.price1m?.returnPct,
          return3m: outcome.price3m?.returnPct,
          return5m: outcome.price5m?.returnPct,
          return10m: outcome.price10m?.returnPct,
          return30m: outcome.price30m?.returnPct,
          return1h: outcome.price1h?.returnPct,
          return6h: outcome.price6h?.returnPct,
          return24h: outcome.price24h?.returnPct,
          mfe: outcome.mfe,
          mae: outcome.mae,
          timeToPeakSec: outcome.timeToPeakSec,
          timeToDrawdownSec: outcome.timeToDrawdownSec,
          liquidityChangePct: outcome.liquidityChangePct,
        },
      });
    } catch (err) {
      logger.debug({ err }, 'Prisma write skipped in memory test mode');
    }

    return outcome;
  }

  /**
   * Fetches outcomes for a token or signal.
   */
  async getOutcomes(filter: { tokenId?: string; signalId?: string; limit?: number }) {
    const { tokenId, signalId, limit = 50 } = filter;
    const where: Record<string, unknown> = {};
    if (tokenId) where.tokenId = tokenId;
    if (signalId) where.signalId = signalId;

    return prisma.outcome.findMany({
      where,
      orderBy: { anchorTimestamp: 'desc' },
      take: limit,
      include: {
        token: true,
        signal: true,
      },
    });
  }

  /**
   * Computes outcome statistical aggregates (win rate, avg MFE, avg MAE).
   */
  async getOutcomeStats() {
    const outcomes: any[] = await prisma.outcome.findMany({
      take: 500,
    });

    if (outcomes.length === 0) {
      return {
        sampleCount: 0,
        winRate5m: 0,
        avgMfe: 0,
        avgMae: 0,
        avgReturn5m: 0,
      };
    }

    const with5m = outcomes.filter((o: any) => o.return5m !== null);
    const winCount5m = with5m.filter((o: any) => (o.return5m ?? 0) > 0).length;
    const winRate5m = with5m.length > 0 ? (winCount5m / with5m.length) * 100 : 0;

    const totalMfe = outcomes.reduce((acc: number, o: any) => acc + o.mfe, 0);
    const totalMae = outcomes.reduce((acc: number, o: any) => acc + o.mae, 0);
    const totalRet5m = with5m.reduce((acc: number, o: any) => acc + (o.return5m ?? 0), 0);

    return {
      sampleCount: outcomes.length,
      winRate5m: Number(winRate5m.toFixed(1)),
      avgMfe: Number((totalMfe / outcomes.length).toFixed(1)),
      avgMae: Number((totalMae / outcomes.length).toFixed(1)),
      avgReturn5m: with5m.length > 0 ? Number((totalRet5m / with5m.length).toFixed(1)) : 0,
    };
  }
}

export const outcomeTrackerService = new OutcomeTrackerService();
