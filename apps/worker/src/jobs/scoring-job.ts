import { createLogger } from '@meme-coin/utils';
import { prisma } from '@meme-coin/database';
import { scoringOrchestrator } from '@meme-coin/core';
import { FeatureVector } from '@meme-coin/types';

const logger = createLogger('scoring-job');

export class ScoringJob {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(private intervalMs = 15000) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Scoring & Decision worker job registered and active');

    this.timer = setInterval(async () => {
      await this.runScoringCycle();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Scoring & Decision worker job stopped');
  }

  async runScoringCycle(): Promise<void> {
    try {
      logger.debug('Running periodic scoring and signal generation cycle...');
      const latestFeatures = await prisma.featureSnapshot.findMany({
        take: 50,
        orderBy: { timestamp: 'desc' },
      });

      for (const featRecord of latestFeatures) {
        const features = featRecord.features as unknown as FeatureVector;
        if (!features || !features.market) continue;

        await scoringOrchestrator.scoreToken({
          tokenId: featRecord.tokenId,
          features,
        });
      }
    } catch (err) {
      logger.debug({ err }, 'Scoring cycle completed (or DB offline)');
    }
  }
}
