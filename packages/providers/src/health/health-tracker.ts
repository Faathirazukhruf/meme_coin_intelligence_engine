import { ProviderHealthReport, ProviderHealthStatus } from '@meme-coin/types';

export class ProviderHealthTracker {
  private status: ProviderHealthStatus = 'HEALTHY';
  private consecutiveFailures = 0;
  private lastCheckedAt = new Date();
  private lastLatencyMs = 0;
  private failureThreshold = 3;

  constructor(public readonly providerName: string, failureThreshold = 3) {
    this.failureThreshold = failureThreshold;
  }

  recordSuccess(latencyMs: number): void {
    this.consecutiveFailures = 0;
    this.status = 'HEALTHY';
    this.lastLatencyMs = latencyMs;
    this.lastCheckedAt = new Date();
  }

  recordFailure(isRateLimited = false): void {
    this.consecutiveFailures++;
    this.lastCheckedAt = new Date();

    if (isRateLimited) {
      this.status = 'RATE_LIMITED';
    } else if (this.consecutiveFailures >= this.failureThreshold) {
      this.status = 'DOWN';
    } else {
      this.status = 'DEGRADED';
    }
  }

  getReport(): ProviderHealthReport {
    return {
      providerName: this.providerName,
      status: this.status,
      latencyMs: this.lastLatencyMs,
      lastCheckedAt: this.lastCheckedAt,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  isAvailable(): boolean {
    return this.status === 'HEALTHY' || this.status === 'DEGRADED';
  }
}
