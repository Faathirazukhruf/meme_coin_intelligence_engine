import { createLogger } from '@meme-coin/utils';
import { WorkerHeartbeat } from './heartbeat.js';
import { IngestionJob } from './jobs/ingestion-job.js';

const logger = createLogger('worker-runner');

export class WorkerRunner {
  private heartbeat: WorkerHeartbeat;
  private ingestionJob: IngestionJob;
  private isShuttingDown = false;

  constructor() {
    this.heartbeat = new WorkerHeartbeat();
    this.ingestionJob = new IngestionJob();
  }

  async start(): Promise<void> {
    logger.info('Initializing Meme Coin Intelligence Engine Worker pipeline...');
    this.heartbeat.start();
    this.ingestionJob.start();

    // Register lifecycle signals for graceful shutdown
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));

    logger.info('Worker runner active and ready for ingestion/scoring/backtest jobs');
  }

  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    logger.info({ signal }, 'Shutting down worker runner gracefully...');

    this.ingestionJob.stop();
    this.heartbeat.stop();

    // Allow pending jobs to drain
    await new Promise((resolve) => setTimeout(resolve, 500));
    logger.info('Worker runner shutdown complete');
    process.exit(0);
  }
}
