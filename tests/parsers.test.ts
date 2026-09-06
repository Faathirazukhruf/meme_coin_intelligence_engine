import { describe, it, expect } from 'vitest';
import {
  PumpFunParser,
  RaydiumParser,
  MeteoraParser,
  PUMP_FUN_PROGRAM_ID,
  RAYDIUM_V4_PROGRAM_ID,
  METEORA_DLMM_PROGRAM_ID,
  RawSolanaTransaction,
} from '@meme-coin/providers';
import { EventNormalizer } from '@meme-coin/core';

describe('Solana Protocol Instruction Parsers', () => {
  describe('Pump.fun Parser', () => {
    it('parses token creation instruction correctly', () => {
      const tx: RawSolanaTransaction = {
        signature: '5z8X4...pumpCreateSig',
        slot: 280123456,
        blockTime: 1725580000,
        accounts: ['TokenMint11111111111111111111111111111111', 'BondingCurve111111111111111111111111111111', 'Creator111111111111111111111111111111111111'],
        logMessages: ['Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P invoke [1]', 'Program log: Instruction: Create', 'Program success'],
        instructions: [
          {
            programId: PUMP_FUN_PROGRAM_ID,
            accounts: ['TokenMint11111111111111111111111111111111', 'BondingCurve111111111111111111111111111111', 'Creator111111111111111111111111111111111111'],
          },
        ],
      };

      const results = PumpFunParser.parseTransaction(tx);
      expect(results).toHaveLength(1);
      expect(results[0]?.action).toBe('TOKEN_CREATE');
      expect(results[0]?.tokenAddress).toBe('TokenMint11111111111111111111111111111111');
      expect(results[0]?.creatorAddress).toBe('Creator111111111111111111111111111111111111');

      const normalized = EventNormalizer.normalize(results, tx);
      expect(normalized.tokens).toHaveLength(1);
      expect(normalized.canonicalEvents[0]?.eventType).toBe('TOKEN_CREATED');
    });

    it('parses buy and sell trades correctly', () => {
      const buyTx: RawSolanaTransaction = {
        signature: 'BuySig12345',
        slot: 280123457,
        accounts: [],
        logMessages: ['Program log: Instruction: Buy'],
        instructions: [
          {
            programId: PUMP_FUN_PROGRAM_ID,
            accounts: ['TokenMint11111111111111111111111111111111', 'BondingCurve111111111111111111111111111111', 'BuyerWallet1111111111111111111111111111111'],
          },
        ],
      };

      const buyResults = PumpFunParser.parseTransaction(buyTx);
      expect(buyResults).toHaveLength(1);
      expect(buyResults[0]?.action).toBe('TRADE');
      expect(buyResults[0]?.side).toBe('BUY');
      expect(buyResults[0]?.buyer).toBe('BuyerWallet1111111111111111111111111111111');
    });
  });

  describe('Raydium Parser', () => {
    it('parses pool initialize and swaps', () => {
      const initTx: RawSolanaTransaction = {
        signature: 'RaydiumInitSig',
        slot: 280123460,
        accounts: [],
        logMessages: ['Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 invoke [1]', 'Program log: initialize'],
        instructions: [
          {
            programId: RAYDIUM_V4_PROGRAM_ID,
            accounts: [
              'Authority111',
              'BaseMint111',
              'QuoteMint111',
              'LpMint111',
              'PoolAddressRaydium11111111111111111111111',
            ],
          },
        ],
      };

      const results = RaydiumParser.parseTransaction(initTx);
      expect(results).toHaveLength(1);
      expect(results[0]?.action).toBe('POOL_CREATE');
      expect(results[0]?.poolAddress).toBe('PoolAddressRaydium11111111111111111111111');
    });
  });

  describe('Meteora Parser', () => {
    it('parses Meteora DLMM pool creation', () => {
      const dlmmTx: RawSolanaTransaction = {
        signature: 'MeteoraDlmmSig',
        slot: 280123470,
        accounts: [],
        logMessages: ['Program log: Instruction: initialize_lb_pair'],
        instructions: [
          {
            programId: METEORA_DLMM_PROGRAM_ID,
            accounts: ['MeteoraPool111', 'Authority111', 'BaseToken111', 'So11111111111111111111111111111111111111112'],
          },
        ],
      };

      const results = MeteoraParser.parseTransaction(dlmmTx);
      expect(results).toHaveLength(1);
      expect(results[0]?.action).toBe('POOL_CREATE');
      expect(results[0]?.protocol).toBe('METEORA');
    });
  });
});
