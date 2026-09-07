import { paperPortfolioManager } from '@meme-coin/core';
import { prisma } from '@meme-coin/database';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('paper-trade-job');

export class PaperTradeJob {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs: number = 10000): void {
    logger.info({ intervalMs }, 'Starting Paper Trade Position Monitor worker job');
    this.timer = setInterval(() => this.execute(), intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Stopped Paper Trade Position Monitor worker job');
    }
  }

  async execute(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const openPositions = paperPortfolioManager.getPositions('FILLED');
      if (openPositions.length === 0) return;

      for (const pos of openPositions) {
        // Fetch latest market snapshot for current price
        const latest = await prisma.marketSnapshot.findFirst({
          where: { tokenId: pos.tokenId },
          orderBy: { timestamp: 'desc' },
        });

        if (latest) {
          const evalResult = paperPortfolioManager.evaluatePriceUpdate(
            pos.id,
            latest.price,
            latest.liquidity
          );

          if (evalResult.triggeredExit) {
            logger.info(
              {
                positionId: pos.id,
                exitType: evalResult.triggeredExit,
                realizedReturn: evalResult.position.realizedReturnPct,
              },
              'Paper trade automatic exit triggered'
            );
          }
        }
      }
    } catch (err) {
      logger.debug({ err }, 'Paper trade monitor tick skipped');
    } finally {
      this.isRunning = false;
    }
  }
}
