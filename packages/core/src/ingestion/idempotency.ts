import crypto from 'crypto';

export class IdempotencyGuard {
  static computePayloadHash(payload: string): string {
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  static computeEventId(chainId: string, txHash: string, eventIndex: number): string {
    return `${chainId}:${txHash}:${eventIndex}`;
  }
}
