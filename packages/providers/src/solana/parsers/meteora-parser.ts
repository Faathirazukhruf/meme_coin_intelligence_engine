import { ParsedInstructionResult, RawSolanaTransaction, SOL_MINT } from './types.js';

export const METEORA_DLMM_PROGRAM_ID = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo';
export const METEORA_DYNAMIC_PROGRAM_ID = 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB';

export class MeteoraParser {
  static isMeteoraInstruction(programId: string): boolean {
    return programId === METEORA_DLMM_PROGRAM_ID || programId === METEORA_DYNAMIC_PROGRAM_ID;
  }

  static parseTransaction(tx: RawSolanaTransaction): ParsedInstructionResult[] {
    const results: ParsedInstructionResult[] = [];
    if (!tx.instructions || tx.err) return results;

    const logs = tx.logMessages || [];
    const isInitialize = logs.some((log) => log.includes('initialize_lb_pair') || log.includes('initialize_permissionless_pair'));
    const isSwap = logs.some((log) => log.includes('swap') || log.includes('swap_exact_in'));

    tx.instructions.forEach((ix, index) => {
      if (!this.isMeteoraInstruction(ix.programId)) return;
      const accounts = ix.accounts || [];

      if (isInitialize && accounts.length >= 4) {
        const poolAddress = accounts[0] || 'unknown';
        const baseToken = accounts[2] || 'unknown';
        const quoteToken = accounts[3] || SOL_MINT;

        results.push({
          protocol: 'METEORA',
          action: 'POOL_CREATE',
          poolAddress,
          tokenAddress: baseToken !== SOL_MINT ? baseToken : quoteToken,
          baseToken,
          quoteToken,
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }

      if (isSwap && accounts.length >= 4) {
        const poolAddress = accounts[0] || 'unknown';
        const user = accounts[1] || 'unknown';

        results.push({
          protocol: 'METEORA',
          action: 'TRADE',
          poolAddress,
          tokenAddress: accounts[2] || 'unknown',
          side: 'BUY',
          buyer: user,
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }
    });

    return results;
  }
}
