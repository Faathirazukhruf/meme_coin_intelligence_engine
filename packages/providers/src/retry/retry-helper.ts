import { createLogger } from '@meme-coin/utils';

const logger = createLogger('retry-helper');

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  providerName: string,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 3000;
  const backoffFactor = options.backoffFactor ?? 2;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    attempt++;
    try {
      return await fn();
    } catch (err: unknown) {
      if (attempt > maxRetries) {
        logger.error({ providerName, attempt, maxRetries, err }, 'Exhausted max retries for provider request');
        throw err;
      }

      logger.warn(
        { providerName, attempt, delayMs: delay, err: (err as Error)?.message },
        'Transient provider error, retrying...'
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(maxDelayMs, delay * backoffFactor);
    }
  }
}
