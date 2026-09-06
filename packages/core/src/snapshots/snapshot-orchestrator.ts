import {
  MarketSnapshotEntity,
  HolderSnapshotEntity,
  SocialSnapshotEntity,
} from '@meme-coin/types';
import { marketSnapshotService, ComputeMarketSnapshotParams } from './market-snapshot-service.js';
import { holderSnapshotService, ComputeHolderSnapshotParams } from './holder-snapshot-service.js';
import { socialSnapshotService, ComputeSocialSnapshotParams } from './social-snapshot-service.js';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('snapshot-orchestrator');

export interface UnifiedSnapshotBundle {
  tokenId: string;
  timestamp: Date;
  market: MarketSnapshotEntity;
  holder: HolderSnapshotEntity;
  social: SocialSnapshotEntity;
  averageQualityScore: number;
}

export class SnapshotOrchestrator {
  /**
   * Computes market, holder, and social snapshots for a token and produces a unified bundle.
   */
  async createSnapshotBundle(
    marketParams: ComputeMarketSnapshotParams,
    holderParams: ComputeHolderSnapshotParams,
    socialParams: ComputeSocialSnapshotParams
  ): Promise<UnifiedSnapshotBundle> {
    const timestamp = marketParams.timestamp || new Date();

    const [market, holder, social] = await Promise.all([
      marketSnapshotService.computeSnapshot({ ...marketParams, timestamp }),
      holderSnapshotService.computeSnapshot({ ...holderParams, timestamp }),
      socialSnapshotService.computeSnapshot({ ...socialParams, timestamp }),
    ]);

    const averageQualityScore = (market.dataQuality + holder.dataQuality + social.dataCompleteness) / 3;

    logger.debug(
      {
        tokenId: marketParams.tokenId,
        marketQuality: market.dataQuality,
        holderQuality: holder.dataQuality,
        socialCompleteness: social.dataCompleteness,
        averageQualityScore,
      },
      'Snapshot bundle computed'
    );

    return {
      tokenId: marketParams.tokenId,
      timestamp,
      market,
      holder,
      social,
      averageQualityScore,
    };
  }
}

export const snapshotOrchestrator = new SnapshotOrchestrator();
