import { ParsedInstructionResult, RawSolanaTransaction, SOL_MINT } from './types.js';

export const RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
export const RAYDIUM_CPMM_PROGRAM_ID = 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C';
export const RAYDIUM_CLMM_PROGRAM_ID = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK';

export class RaydiumParser {
  static isRaydiumInstruction(programId: string): boolean {
    return (
      programId === RAYDIUM_V4_PROGRAM_ID ||
      programId === RAYDIUM_CPMM_PROGRAM_ID ||
      programId === RAYDIUM_CLMM_PROGRAM_ID
    );
  }

  static parseTransaction(tx: RawSolanaTransaction): ParsedInstructionResult[] {
    const results: ParsedInstructionResult[] = [];
    if (!tx.instructions || tx.err) return results;

    const logs = tx.logMessages || [];
    const isInitialize = logs.some((log) => log.includes('initialize') || log.includes('InitializePool') || log.includes('init_pool'));
    const isSwap = logs.some((log) => log.includes('swap') || log.includes('SwapBaseIn') || log.includes('SwapBaseOut'));
    const isAddLiquidity = logs.some((log) => log.includes('deposit') || log.includes('AddLiquidity'));
    const isRemoveLiquidity = logs.some((log) => log.includes('withdraw') || log.includes('RemoveLiquidity'));

    tx.instructions.forEach((ix, index) => {
      if (!this.isRaydiumInstruction(ix.programId)) return;
      const accounts = ix.accounts || [];

      // Pool Initialization
      if (isInitialize && accounts.length >= 5) {
        const poolAddress = accounts[4] || accounts[0] || 'unknown';
        const baseToken = accounts[8] || accounts[1] || 'unknown';
        const quoteToken = accounts[9] || accounts[2] || SOL_MINT;

        results.push({
          protocol: 'RAYDIUM',
          action: 'POOL_CREATE',
          poolAddress,
          tokenAddress: baseToken !== SOL_MINT ? baseToken : quoteToken,
          baseToken,
          quoteToken,
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }

      // Swaps
      if (isSwap && accounts.length >= 6) {
        const poolAddress = accounts[1] || 'unknown';
        const user = accounts[0] || 'unknown';
        const baseToken = accounts[4] || 'unknown';
        const quoteToken = accounts[5] || SOL_MINT;
        const isSolQuote = quoteToken === SOL_MINT;

        results.push({
          protocol: 'RAYDIUM',
          action: 'TRADE',
          poolAddress,
          tokenAddress: isSolQuote ? baseToken : quoteToken,
          baseToken,
          quoteToken,
          side: isSolQuote ? 'BUY' : 'SELL',
          buyer: isSolQuote ? user : undefined,
          seller: isSolQuote ? undefined : user,
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }

      // Liquidity Operations
      if (isAddLiquidity && accounts.length >= 4) {
        results.push({
          protocol: 'RAYDIUM',
          action: 'LIQUIDITY_ADD',
          poolAddress: accounts[1] || accounts[0],
          tokenAddress: accounts[2],
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }

      if (isRemoveLiquidity && accounts.length >= 4) {
        results.push({
          protocol: 'RAYDIUM',
          action: 'LIQUIDITY_REMOVE',
          poolAddress: accounts[1] || accounts[0],
          tokenAddress: accounts[2],
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }
    });

    return results;
  }
}
