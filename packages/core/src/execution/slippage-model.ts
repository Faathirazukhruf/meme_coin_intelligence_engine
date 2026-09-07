export interface SlippageModelParams {
  tradeSizeUsd: number;
  poolLiquidityUsd: number;
  baseSlippagePct?: number; // Base minimum slippage (e.g. 0.5%)
  isHighVolatility?: boolean;
}

export class SlippageModel {
  /**
   * Computes realistic price impact and estimated slippage on Solana AMMs.
   * Model: PriceImpact = TradeSize / (2 * PoolLiquidity) + BaseSlippage + VolatilityJitter.
   */
  static estimateSlippage(params: SlippageModelParams): {
    slippagePct: number;
    priceImpactPct: number;
    isExcessive: boolean;
  } {
    const { tradeSizeUsd, poolLiquidityUsd, baseSlippagePct = 0.5, isHighVolatility = false } = params;

    if (poolLiquidityUsd <= 0) {
      return {
        slippagePct: 100,
        priceImpactPct: 100,
        isExcessive: true,
      };
    }

    // AMM Constant Product Price Impact formula
    const priceImpactPct = (tradeSizeUsd / (2 * poolLiquidityUsd)) * 100;

    // Volatility adder
    const volAdder = isHighVolatility ? 1.0 : 0.2;

    const totalSlippagePct = baseSlippagePct + priceImpactPct + volAdder;

    // A trade is excessive if slippage > 5% or trade size > 5% of pool
    const isExcessive = totalSlippagePct > 5.0 || tradeSizeUsd > poolLiquidityUsd * 0.05;

    return {
      slippagePct: Number(totalSlippagePct.toFixed(3)),
      priceImpactPct: Number(priceImpactPct.toFixed(3)),
      isExcessive,
    };
  }

  /**
   * Computes effective fill price after slippage.
   * For Buy: FillPrice = MarketPrice * (1 + SlippagePct / 100)
   * For Sell: FillPrice = MarketPrice * (1 - SlippagePct / 100)
   */
  static applySlippageToPrice(
    marketPrice: number,
    slippagePct: number,
    side: 'BUY' | 'SELL'
  ): number {
    if (side === 'BUY') {
      return marketPrice * (1 + slippagePct / 100);
    } else {
      return marketPrice * Math.max(0, 1 - slippagePct / 100);
    }
  }
}
