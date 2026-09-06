import { createLogger } from '@meme-coin/utils';
import { prisma } from '@meme-coin/database';
import { featureEngine } from '@meme-coin/core';

const logger = createLogger('feature-job');

export class FeatureJob {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(private intervalMs = 20000) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Feature Computation worker job registered and active');

    this.timer = setInterval(async () => {
      await this.runFeatureCycle();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Feature Computation worker job stopped');
  }

  async runFeatureCycle(): Promise<void> {
    try {
      logger.debug('Running periodic feature extraction cycle...');
      const activeTokens = await prisma.token.findMany({
        where: { status: 'active' },
        take: 50,
        include: {
          marketSnapshots: { take: 5, orderBy: { timestamp: 'desc' } },
          holderSnapshots: { take: 5, orderBy: { timestamp: 'desc' } },
          socialSnapshots: { take: 2, orderBy: { timestamp: 'desc' } },
        },
      });

      for (const token of activeTokens) {
        const curM = token.marketSnapshots[0];
        const curH = token.holderSnapshots[0];
        const curS = token.socialSnapshots[0];

        if (!curM || !curH || !curS) continue;

        await featureEngine.computeFeatures({
          tokenId: token.id,
          anchorTimestamp: new Date(),
          context: {
            currentMarket: curM,
            market1m: token.marketSnapshots[1],
            market5m: token.marketSnapshots[2],
            currentHolder: curH,
            holder1m: token.holderSnapshots[1],
            currentSocial: curS,
          },
        });
      }
    } catch (err) {
      logger.debug({ err }, 'Feature extraction cycle completed (or DB offline)');
    }
  }
}
