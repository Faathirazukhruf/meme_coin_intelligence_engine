import { PaperExecutionSimulation } from '@meme-coin/types';
import { SlippageModel } from './slippage-model.js';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('execution-simulator');

export interface SimulatedOrderParams {
  signalId: string;
  tokenId: string;
  marketPrice: number;
  poolLiquidityUsd: number;
  positionSizeUsd: number;
  simulatedLatencyMs?: number; // e.g. 800ms Solana slot confirmation
  gasFeeSol?: number;          // e.g. 0.000005 SOL
  priorityFeeSol?: number;     // e.g. 0.001 SOL
  solPriceUsd?: number;        // e.g. $150
  dexFeePct?: number;          // e.g. 0.25% Raydium / 1.0% Pump.fun
}

export class ExecutionSimulator {
  /**
   * Simulates realistic order entry on Solana with slippage, gas/priority fees, and latency.
   */
  static simulateEntry(params: SimulatedOrderParams): PaperExecutionSimulation {
    const {
      signalId,
      tokenId,
      marketPrice,
      poolLiquidityUsd,
      positionSizeUsd,
      simulatedLatencyMs = 800,
      gasFeeSol = 0.000005,
      priorityFeeSol = 0.0005,
      solPriceUsd = 150,
      dexFeePct = 0.30,
    } = params;

    // Estimate Slippage
    const { slippagePct } = SlippageModel.estimateSlippage({
      tradeSizeUsd: positionSizeUsd,
      poolLiquidityUsd,
    });

    // Compute Fill Price after slippage
    const simulatedEntryPrice = SlippageModel.applySlippageToPrice(
      marketPrice,
      slippagePct,
      'BUY'
    );

    // Compute fees in USD
    const networkFeeUsd = (gasFeeSol + priorityFeeSol) * solPriceUsd;
    const dexFeeUsd = positionSizeUsd * (dexFeePct / 100);
    const estimatedFeeUsd = Number((networkFeeUsd + dexFeeUsd).toFixed(3));

    logger.debug(
      { tokenId, marketPrice, simulatedEntryPrice, slippagePct, estimatedFeeUsd },
      'Simulated entry execution completed'
    );

    return {
      signalId,
      tokenId,
      simulatedEntryPrice: Number(simulatedEntryPrice.toFixed(8)),
      simulatedExitPrice: null,
      entryLatencyMs: simulatedLatencyMs,
      slippagePct,
      estimatedFeeUsd,
      positionSizeUsd,
      realizedPnlUsd: null,
      realizedReturnPct: null,
      status: 'FILLED',
    };
  }

  /**
   * Simulates order exit with exit slippage and exit DEX/network fees.
   */
  static simulateExit(
    trade: PaperExecutionSimulation,
    exitMarketPrice: number,
    poolLiquidityUsd: number,
    solPriceUsd: number = 150
  ): PaperExecutionSimulation {
    const { slippagePct } = SlippageModel.estimateSlippage({
      tradeSizeUsd: trade.positionSizeUsd,
      poolLiquidityUsd,
    });

    const simulatedExitPrice = SlippageModel.applySlippageToPrice(
      exitMarketPrice,
      slippagePct,
      'SELL'
    );

    // Calculate gross and net PnL
    const tokensHeld = trade.positionSizeUsd / trade.simulatedEntryPrice;
    const exitGrossValueUsd = tokensHeld * simulatedExitPrice;

    const exitFeeUsd = 0.0005 * solPriceUsd + exitGrossValueUsd * 0.003;
    const totalFeesUsd = trade.estimatedFeeUsd + exitFeeUsd;

    const realizedPnlUsd = exitGrossValueUsd - trade.positionSizeUsd - exitFeeUsd;
    const realizedReturnPct = (realizedPnlUsd / trade.positionSizeUsd) * 100;

    return {
      ...trade,
      simulatedExitPrice: Number(simulatedExitPrice.toFixed(8)),
      estimatedFeeUsd: Number(totalFeesUsd.toFixed(3)),
      realizedPnlUsd: Number(realizedPnlUsd.toFixed(2)),
      realizedReturnPct: Number(realizedReturnPct.toFixed(2)),
      status: 'CLOSED',
    };
  }
}
