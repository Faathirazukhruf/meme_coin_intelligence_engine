import { signalLifecycleService, signalFilterEngine, alertDispatcher } from '@meme-coin/core';
import { prisma } from '@meme-coin/database';
import { createLogger } from '@meme-coin/utils';
import { Decision } from '@meme-coin/types';

const logger = createLogger('signal-job');

export class SignalJob {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs: number = 20000): void {
    logger.info({ intervalMs }, 'Starting Signal & Alert lifecycle worker job');
    this.timer = setInterval(() => this.execute(), intervalMs);
    // Run initial tick
    setTimeout(() => this.execute(), 1000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Stopped Signal lifecycle worker job');
    }
  }

  async execute(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // 1. Expire stale signals older than 2 hours
      const expiredCount = await signalLifecycleService.expireStaleSignals(120);
      if (expiredCount > 0) {
        logger.debug({ expiredCount }, 'Expired stale active signals');
      }

      // 2. Query recent active signals that may need alerting
      const cutoff = new Date(Date.now() - 5 * 60 * 1000);
      const recentSignals = await prisma.signal.findMany({
        where: {
          status: 'ACTIVE',
          timestamp: { gte: cutoff },
          decision: {
            in: [
              'PAPER_TRADE_CANDIDATE',
              'HIGH_PRIORITY',
              'ALERT',
            ],
          },
        },
        include: {
          token: true,
          scoreSnapshot: true,
        },
        take: 20,
      });

      for (const sig of recentSignals) {
        if (!sig.scoreSnapshot) continue;

        const details = sig.scoreSnapshot.details as any;
        if (!details || !details.risk || !details.opportunity) continue;

        const scoreResult = {
          id: sig.scoreSnapshot.id,
          tokenId: sig.tokenId,
          timestamp: sig.scoreSnapshot.timestamp,
          hardVeto: details.hardVeto || { isVetoed: false },
          risk: details.risk,
          opportunity: details.opportunity,
          riskMultiplier: details.riskMultiplier || 1,
          finalScore: sig.scoreSnapshot.finalScore,
          confidenceScore: sig.scoreSnapshot.confidenceScore,
          scoringVersion: sig.scoreSnapshot.scoringVersion,
        };

        const filterRes = signalFilterEngine.evaluate(
          {
            id: sig.id,
            tokenId: sig.tokenId,
            timestamp: sig.timestamp,
            signalType: sig.signalType,
            scoreSnapshotId: sig.scoreSnapshotId,
            decision: sig.decision as Decision,
            reason: sig.reason,
            status: sig.status as any,
          },
          scoreResult
        );

        if (filterRes.shouldAlert) {
          await alertDispatcher.dispatch(
            {
              id: sig.id,
              tokenId: sig.tokenId,
              timestamp: sig.timestamp,
              signalType: sig.signalType,
              scoreSnapshotId: sig.scoreSnapshotId,
              decision: sig.decision as Decision,
              reason: sig.reason,
              status: sig.status as any,
            },
            scoreResult,
            filterRes,
            sig.token?.symbol || 'TOKEN'
          );
        }
      }
    } catch (err) {
      logger.debug({ err }, 'Signal lifecycle tick skipped');
    } finally {
      this.isRunning = false;
    }
  }
}
