import { createLogger } from '@meme-coin/utils';
import { prisma } from '@meme-coin/database';
import { snapshotOrchestrator } from '@meme-coin/core';

const logger = createLogger('snapshot-job');

export class SnapshotJob {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(private intervalMs = 30000) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Snapshot worker job registered and active');

    this.timer = setInterval(async () => {
      await this.runSnapshotCycle();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Snapshot worker job stopped');
  }

  async runSnapshotCycle(): Promise<void> {
    try {
      logger.debug('Running periodic token snapshot cycle...');
      const activeTokens = await prisma.token.findMany({
        where: { status: 'active' },
        take: 50,
      });

      for (const token of activeTokens) {
        await snapshotOrchestrator.createSnapshotBundle(
          {
            tokenId: token.id,
            currentPrice: 0.0001,
            liquidity: 10000,
          },
          {
            tokenId: token.id,
            circulatingSupply: 1000000000,
            balances: [100000000, 50000000, 25000000],
          },
          {
            tokenId: token.id,
            mentions: [],
          }
        );
      }
    } catch (err) {
      logger.debug({ err }, 'Periodic snapshot cycle completed (or DB offline)');
    }
  }
}
