import { ParsedInstructionResult, RawSolanaTransaction, SOL_MINT } from './types.js';

export const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

export class PumpFunParser {
  static isPumpFunInstruction(programId: string): boolean {
    return programId === PUMP_FUN_PROGRAM_ID;
  }

  static parseTransaction(tx: RawSolanaTransaction): ParsedInstructionResult[] {
    const results: ParsedInstructionResult[] = [];
    if (!tx.instructions || tx.err) return results;

    const logs = tx.logMessages || [];
    const isCreate = logs.some((log) => log.includes('Instruction: Create') || log.includes('Program log: create'));
    const isBuy = logs.some((log) => log.includes('Instruction: Buy') || log.includes('Program log: buy'));
    const isSell = logs.some((log) => log.includes('Instruction: Sell') || log.includes('Program log: sell'));
    const isGraduate = logs.some(
      (log) => log.includes('Instruction: Complete') || log.includes('bonding curve complete')
    );

    tx.instructions.forEach((ix, index) => {
      if (!this.isPumpFunInstruction(ix.programId)) return;

      const accounts = ix.accounts || [];
      // Pump.fun account structure for create: [mint, bondingCurve, user, ...]
      if (isCreate && accounts.length >= 3) {
        const tokenAddress = accounts[0] || 'unknown';
        const poolAddress = accounts[1] || 'unknown';
        const creatorAddress = accounts[2] || 'unknown';

        results.push({
          protocol: 'PUMP_FUN',
          action: 'TOKEN_CREATE',
          tokenAddress,
          creatorAddress,
          poolAddress,
          baseToken: tokenAddress,
          quoteToken: SOL_MINT,
          decimals: 6,
          eventIndex: index,
          rawDetails: { signature: tx.signature, slot: tx.slot },
        });
      }

      // Buy trade
      if (isBuy && accounts.length >= 3) {
        const tokenAddress = accounts[0] || 'unknown';
        const poolAddress = accounts[1] || 'unknown';
        const buyer = accounts[2] || 'unknown';

        results.push({
          protocol: 'PUMP_FUN',
          action: 'TRADE',
          side: 'BUY',
          tokenAddress,
          poolAddress,
          baseToken: tokenAddress,
          quoteToken: SOL_MINT,
          buyer,
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }

      // Sell trade
      if (isSell && accounts.length >= 3) {
        const tokenAddress = accounts[0] || 'unknown';
        const poolAddress = accounts[1] || 'unknown';
        const seller = accounts[2] || 'unknown';

        results.push({
          protocol: 'PUMP_FUN',
          action: 'TRADE',
          side: 'SELL',
          tokenAddress,
          poolAddress,
          baseToken: tokenAddress,
          quoteToken: SOL_MINT,
          seller,
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }

      // Token Graduation
      if (isGraduate && accounts.length >= 2) {
        results.push({
          protocol: 'PUMP_FUN',
          action: 'TOKEN_GRADUATE',
          tokenAddress: accounts[0],
          poolAddress: accounts[1],
          eventIndex: index,
          rawDetails: { signature: tx.signature },
        });
      }
    });

    return results;
  }
}
