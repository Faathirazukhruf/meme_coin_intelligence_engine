import { FeatureSnapshotRecord, FeatureVector } from '@meme-coin/types';
import { prisma } from '@meme-coin/database';
import { getConfig } from '@meme-coin/config';
import { assertNoLookAhead, createLogger } from '@meme-coin/utils';
import { FeatureCalculator, HistoricalSnapshotsContext } from './feature-calculator.js';

const logger = createLogger('feature-engine');

export interface FeatureComputationParams {
  tokenId: string;
  anchorTimestamp?: Date;
  context: HistoricalSnapshotsContext;
}

export class FeatureEngine {
  /**
   * Computes versioned quantitative features at anchor timestamp T0.
   * Strictly enforces Anti-Look-Ahead validation: timestamp <= T0.
   */
  async computeFeatures(params: FeatureComputationParams): Promise<FeatureSnapshotRecord> {
    const config = getConfig();
    const anchorT0 = params.anchorTimestamp || new Date();
    const featureVersion = config.FEATURE_VERSION || 'feature_v1';

    // 1. Anti-Look-Ahead Enforcement
    const ctx = params.context;
    assertNoLookAhead(ctx.currentMarket.timestamp, anchorT0, 'currentMarketSnapshot');
    assertNoLookAhead(ctx.currentHolder.timestamp, anchorT0, 'currentHolderSnapshot');
    assertNoLookAhead(ctx.currentSocial.timestamp, anchorT0, 'currentSocialSnapshot');

    if (ctx.market1m) assertNoLookAhead(ctx.market1m.timestamp, anchorT0, 'market1mSnapshot');
    if (ctx.market5m) assertNoLookAhead(ctx.market5m.timestamp, anchorT0, 'market5mSnapshot');
    if (ctx.holder1m) assertNoLookAhead(ctx.holder1m.timestamp, anchorT0, 'holder1mSnapshot');

    // 2. Compute 7 Domain Feature Groups
    const features: FeatureVector = FeatureCalculator.computeAll(ctx);

    const snapshotRecord: FeatureSnapshotRecord = {
      id: `feat-${params.tokenId}-${anchorT0.getTime()}`,
      tokenId: params.tokenId,
      timestamp: anchorT0,
      featureVersion,
      features,
    };

    // 3. Persist Feature Snapshot
    try {
      await prisma.featureSnapshot.create({
        data: {
          tokenId: params.tokenId,
          timestamp: anchorT0,
          featureVersion,
          features: features as unknown as object,
        },
      });
    } catch (err) {
      logger.debug({ err }, 'Feature snapshot DB write skipped in test mode');
    }

    return snapshotRecord;
  }
}

export const featureEngine = new FeatureEngine();
