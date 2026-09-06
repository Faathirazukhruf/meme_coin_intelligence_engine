import { describe, it, expect } from 'vitest';
import { IdempotencyGuard, IngestionService } from '@meme-coin/core';
import { PUMP_FUN_PROGRAM_ID, RawSolanaTransaction } from '@meme-coin/providers';

describe('Idempotency & Deduplication Engine Tests', () => {
  it('computes stable SHA-256 payload hashes', () => {
    const payload = JSON.stringify({ signature: 'sig123', slot: 100 });
    const hash1 = IdempotencyGuard.computePayloadHash(payload);
    const hash2 = IdempotencyGuard.computePayloadHash(payload);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('computes unique and deterministic canonical event ids', () => {
    const id1 = IdempotencyGuard.computeEventId('solana', 'tx12345', 0);
    const id2 = IdempotencyGuard.computeEventId('solana', 'tx12345', 1);

    expect(id1).toBe('solana:tx12345:0');
    expect(id2).toBe('solana:tx12345:1');
  });

  it('processes repeated transaction payloads consistently', async () => {
    const service = new IngestionService();
    const rawTx: RawSolanaTransaction = {
      signature: 'IdempotencyTxSignature12345',
      slot: 280555555,
      blockTime: 1725590000,
      accounts: ['Mint111', 'Bonding111', 'Creator111'],
      logMessages: ['Program log: Instruction: Create'],
      instructions: [
        {
          programId: PUMP_FUN_PROGRAM_ID,
          accounts: ['Mint111', 'Bonding111', 'Creator111'],
        },
      ],
    };

    const res1 = await service.ingestTransaction(rawTx);
    const res2 = await service.ingestTransaction(rawTx);

    expect(res1.rawPayloadHash).toBe(res2.rawPayloadHash);
    expect(res1.tokenCount).toBe(1);
    expect(res2.tokenCount).toBe(1);
  });
});
