import { createLogger } from '@meme-coin/utils';
import { ingestionService } from '@meme-coin/core';
import { RawSolanaTransaction } from '@meme-coin/providers';

const logger = createLogger('ingestion-job');

export class IngestionJob {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(private intervalMs = 10000) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Solana Ingestion worker job registered and active');

    this.timer = setInterval(async () => {
      await this.pollNewTransactions();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Solana Ingestion worker job stopped');
  }

  async pollNewTransactions(): Promise<void> {
    try {
      logger.debug('Polling new Solana transactions / stream events...');
      // Worker polling hook
    } catch (err) {
      logger.error({ err }, 'Error occurred during ingestion worker poll');
    }
  }

  async processIncomingTransaction(tx: RawSolanaTransaction): Promise<void> {
    const result = await ingestionService.ingestTransaction(tx);
    logger.info(
      {
        signature: tx.signature,
        trades: result.tradeCount,
        tokens: result.tokenCount,
        pools: result.poolCount,
      },
      'Transaction successfully normalized and processed'
    );
  }
}
