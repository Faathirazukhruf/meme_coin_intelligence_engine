import { prisma } from '@meme-coin/database';
import {
  NarrativeClusterEngine,
  CANONICAL_NARRATIVES,
} from '@meme-coin/core';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('narrative-job');

export class NarrativeJob {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs: number = 60000): void {
    logger.info({ intervalMs }, 'Starting Narrative & Social clustering worker job');
    this.timer = setInterval(() => this.execute(), intervalMs);
    setTimeout(() => this.execute(), 3000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Stopped Narrative & Social clustering worker job');
    }
  }

  async execute(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // 1. Ensure canonical narratives exist in DB
      for (const nar of CANONICAL_NARRATIVES) {
        await prisma.narrative.upsert({
          where: { name: nar.name },
          create: {
            id: nar.id,
            name: nar.name,
            category: nar.category,
          },
          update: {},
        });
      }

      // 2. Scan recent unlinked tokens
      const recentTokens = await prisma.token.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      for (const t of recentTokens) {
        const matches = NarrativeClusterEngine.detectNarratives(t.symbol, t.name);
        if (matches.length > 0) {
          await NarrativeClusterEngine.linkTokenToNarratives(t.id, matches);
        }
      }

      logger.debug('Narrative clustering and momentum sweep complete');
    } catch (err) {
      logger.debug({ err }, 'Narrative job tick skipped');
    } finally {
      this.isRunning = false;
    }
  }
}
