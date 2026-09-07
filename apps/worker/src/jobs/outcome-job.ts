import { outcomeTrackerService } from '@meme-coin/core';
import { prisma } from '@meme-coin/database';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('outcome-job');

export class OutcomeJob {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs: number = 30000): void {
    logger.info({ intervalMs }, 'Starting Forward Outcome Tracking worker job');
    this.timer = setInterval(() => this.execute(), intervalMs);
    setTimeout(() => this.execute(), 2000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Stopped Forward Outcome Tracking worker job');
    }
  }

  async execute(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // Find active or recent signals in the past 24 hours that need forward evaluation
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const signals = await prisma.signal.findMany({
        where: {
          timestamp: { gte: cutoff },
          decision: { in: ['PAPER_TRADE_CANDIDATE', 'HIGH_PRIORITY', 'ALERT'] },
        },
        take: 30,
        orderBy: { timestamp: 'desc' },
      });

      for (const sig of signals) {
        await outcomeTrackerService.trackSignalOutcome(sig.id);
      }
    } catch (err) {
      logger.debug({ err }, 'Outcome tracking tick skipped');
    } finally {
      this.isRunning = false;
    }
  }
}
