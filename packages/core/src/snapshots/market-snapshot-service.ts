import { MarketSnapshotEntity } from '@meme-coin/types';
import { prisma } from '@meme-coin/database';
import { DataQualityScorer } from './data-quality.js';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('market-snapshot-service');

export interface ComputeMarketSnapshotParams {
  tokenId: string;
  poolId?: string;
  timestamp?: Date;
  currentPrice: number;
  marketCap?: number;
  fdv?: number;
  liquidity: number;
  trades?: Array<{
    eventTime: Date;
    side: string;
    quoteAmount: number;
  }>;
}

export class MarketSnapshotService {
  /**
   * Computes an immutable market snapshot for a token at a given timestamp.
   */
  async computeSnapshot(params: ComputeMarketSnapshotParams): Promise<MarketSnapshotEntity> {
    const ts = params.timestamp || new Date();
    const tsTime = ts.getTime();

    const t1m = new Date(tsTime - 60 * 1000);
    const t5m = new Date(tsTime - 5 * 60 * 1000);
    const t15m = new Date(tsTime - 15 * 60 * 1000);

    let tradesList = params.trades;
    if (!tradesList) {
      try {
        const fetched = await prisma.trade.findMany({
          where: {
            tokenId: params.tokenId,
            eventTime: {
              gte: t15m,
              lte: ts,
            },
          },
          select: {
            eventTime: true,
            side: true,
            quoteAmount: true,
          },
        });
        tradesList = fetched;
      } catch {
        tradesList = [];
      }
    }

    const trades = tradesList ?? [];

    let volume1m = 0;
    let volume5m = 0;
    let volume15m = 0;
    let buyVolume = 0;
    let sellVolume = 0;
    let buyCount = 0;
    let sellCount = 0;

    for (const tr of trades) {
      const trTime = tr.eventTime.getTime();
      const amount = tr.quoteAmount;

      if (trTime >= t1m.getTime()) volume1m += amount;
      if (trTime >= t5m.getTime()) volume5m += amount;
      if (trTime >= t15m.getTime()) {
        volume15m += amount;
        if (tr.side === 'BUY') {
          buyVolume += amount;
          buyCount++;
        } else {
          sellVolume += amount;
          sellCount++;
        }
      }
    }

    const txCount = buyCount + sellCount;
    const latestTradeTime = trades.length > 0 ? Math.max(...trades.map((t) => t.eventTime.getTime())) : 0;
    const timeSinceLastTradeSec = latestTradeTime > 0 ? Math.max(0, Math.floor((tsTime - latestTradeTime) / 1000)) : 9999;

    const dataQuality = DataQualityScorer.evaluateMarketQuality({
      hasPrice: params.currentPrice > 0,
      hasLiquidity: params.liquidity > 0,
      hasVolume: volume15m > 0,
      tradeCount: txCount,
      timeSinceLastTradeSec,
    });

    const snapshot: MarketSnapshotEntity = {
      id: `${params.tokenId}-${tsTime}`,
      tokenId: params.tokenId,
      poolId: params.poolId || null,
      timestamp: ts,
      price: params.currentPrice,
      marketCap: params.marketCap || params.currentPrice * 1000000000,
      fdv: params.fdv || params.currentPrice * 1000000000,
      liquidity: params.liquidity,
      volume1m,
      volume5m,
      volume15m,
      buyVolume,
      sellVolume,
      buyCount,
      sellCount,
      txCount,
      dataQuality,
    };

    // Append to PostgreSQL without mutating past records
    try {
      await prisma.marketSnapshot.create({
        data: {
          tokenId: snapshot.tokenId,
          poolId: snapshot.poolId,
          timestamp: snapshot.timestamp,
          price: snapshot.price,
          marketCap: snapshot.marketCap,
          fdv: snapshot.fdv,
          liquidity: snapshot.liquidity,
          volume1m: snapshot.volume1m,
          volume5m: snapshot.volume5m,
          volume15m: snapshot.volume15m,
          buyVolume: snapshot.buyVolume,
          sellVolume: snapshot.sellVolume,
          buyCount: snapshot.buyCount,
          sellCount: snapshot.sellCount,
          txCount: snapshot.txCount,
          dataQuality: snapshot.dataQuality,
        },
      });
    } catch (err) {
      logger.debug({ err }, 'DB write skipped in memory test mode');
    }

    return snapshot;
  }
}

export const marketSnapshotService = new MarketSnapshotService();
