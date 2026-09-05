import { ProviderHealthReport } from '@meme-coin/types';
import { ProviderHealthTracker } from './health/health-tracker.js';
import { createLogger } from '@meme-coin/utils';

export abstract class BaseProvider {
  protected healthTracker: ProviderHealthTracker;
  protected logger: ReturnType<typeof createLogger>;

  constructor(public readonly name: string) {
    this.healthTracker = new ProviderHealthTracker(name);
    this.logger = createLogger(name);
  }

  async getHealth(): Promise<ProviderHealthReport> {
    return this.healthTracker.getReport();
  }

  protected recordSuccess(latencyMs: number): void {
    this.healthTracker.recordSuccess(latencyMs);
  }

  protected recordFailure(isRateLimited = false): void {
    this.healthTracker.recordFailure(isRateLimited);
  }
}
