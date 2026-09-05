import { createLogger } from '@meme-coin/utils';

const logger = createLogger('worker-heartbeat');

export class WorkerHeartbeat {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private intervalMs = 15000) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Worker heartbeat started');

    this.timer = setInterval(() => {
      logger.debug(
        {
          memory: process.memoryUsage().rss / (1024 * 1024),
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
        'Worker heartbeat alive'
      );
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('Worker heartbeat stopped');
  }
}
