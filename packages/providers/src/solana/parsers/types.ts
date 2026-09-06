import { TradeSide } from '@meme-coin/types';

export const SOL_MINT = 'So11111111111111111111111111111111111111112';

export interface ParsedInstructionResult {
  protocol: 'PUMP_FUN' | 'RAYDIUM' | 'METEORA' | 'SYSTEM' | 'UNKNOWN';
  action:
    | 'TOKEN_CREATE'
    | 'POOL_CREATE'
    | 'TRADE'
    | 'LIQUIDITY_ADD'
    | 'LIQUIDITY_REMOVE'
    | 'TOKEN_GRADUATE'
    | 'TRANSFER'
    | 'UNKNOWN';
  tokenAddress?: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  creatorAddress?: string;
  poolAddress?: string;
  baseToken?: string;
  quoteToken?: string;
  side?: TradeSide;
  price?: number;
  baseAmount?: number;
  quoteAmount?: number;
  buyer?: string;
  seller?: string;
  liquidityAmount?: number;
  eventIndex: number;
  rawDetails?: Record<string, unknown>;
}

export interface RawSolanaTransaction {
  signature: string;
  slot: number | bigint;
  blockTime?: number | null;
  fee?: number;
  err?: unknown | null;
  accounts: string[];
  logMessages?: string[];
  instructions: Array<{
    programId: string;
    data?: string;
    accounts?: string[];
    parsed?: Record<string, unknown>;
  }>;
  innerInstructions?: Array<{
    index: number;
    instructions: Array<{
      programId: string;
      data?: string;
      accounts?: string[];
      parsed?: Record<string, unknown>;
    }>;
  }>;
}
