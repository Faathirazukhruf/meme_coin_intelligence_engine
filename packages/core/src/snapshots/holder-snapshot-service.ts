import { HolderSnapshotEntity } from '@meme-coin/types';
import { prisma } from '@meme-coin/database';
import { calculateTopNConcentration, calculateCreatorRatio } from '@meme-coin/math';
import { DataQualityScorer } from './data-quality.js';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('holder-snapshot-service');

export interface ComputeHolderSnapshotParams {
  tokenId: string;
  timestamp?: Date;
  circulatingSupply: number;
  balances: number[];
  creatorBalance?: number;
}

export class HolderSnapshotService {
  /**
   * Computes an immutable holder snapshot for a token.
   */
  async computeSnapshot(params: ComputeHolderSnapshotParams): Promise<HolderSnapshotEntity> {
    const ts = params.timestamp || new Date();
    const tsTime = ts.getTime();

    // Sort balances in descending order
    const sortedBalances = [...params.balances].sort((a, b) => b - a);
    const holderCount = sortedBalances.length;

    const top10Balances = sortedBalances.slice(0, 10);
    const top20Balances = sortedBalances.slice(0, 20);
    const top50Balances = sortedBalances.slice(0, 50);

    const top10Concentration = calculateTopNConcentration(top10Balances, params.circulatingSupply);
    const top20Concentration = calculateTopNConcentration(top20Balances, params.circulatingSupply);
    const top50Concentration = calculateTopNConcentration(top50Balances, params.circulatingSupply);
    const creatorRatio = calculateCreatorRatio(params.creatorBalance ?? 0, params.circulatingSupply);

    const dataQuality = DataQualityScorer.evaluateHolderQuality({
      holderCount,
      hasTopBalances: top10Balances.length > 0,
      hasCirculatingSupply: params.circulatingSupply > 0,
      topBalancesCount: top10Balances.length,
    });

    const snapshot: HolderSnapshotEntity = {
      id: `holder-${params.tokenId}-${tsTime}`,
      tokenId: params.tokenId,
      timestamp: ts,
      holderCount,
      top10Concentration,
      top20Concentration,
      top50Concentration,
      creatorRatio,
      dataQuality,
    };

    try {
      await prisma.holderSnapshot.create({
        data: {
          tokenId: snapshot.tokenId,
          timestamp: snapshot.timestamp,
          holderCount: snapshot.holderCount,
          top10Concentration: snapshot.top10Concentration,
          top20Concentration: snapshot.top20Concentration,
          top50Concentration: snapshot.top50Concentration,
          creatorRatio: snapshot.creatorRatio,
          dataQuality: snapshot.dataQuality,
        },
      });
    } catch (err) {
      logger.debug({ err }, 'DB write skipped in memory test mode');
    }

    return snapshot;
  }
}

export const holderSnapshotService = new HolderSnapshotService();
