export interface PositionSizingParams {
  accountBalanceUsd: number;
  finalScore: number;       // 0 - 100
  riskScore: number;        // 0 - 100 (lower is safer)
  confidenceScore: number;  // 0 - 100
  poolLiquidityUsd: number;
  maxAccountRiskPct?: number; // e.g., max 2% balance risk per trade
  maxPoolPct?: number;        // e.g., max 1% of pool liquidity
}

export class PositionSizer {
  /**
   * Computes risk-adjusted position size based on Final Score, Risk Score, and Pool Depth.
   */
  static calculatePositionSize(params: PositionSizingParams): {
    positionSizeUsd: number;
    sizingFactor: number;
    reason: string;
  } {
    const {
      accountBalanceUsd,
      finalScore,
      riskScore,
      confidenceScore,
      poolLiquidityUsd,
      maxAccountRiskPct = 2.0,
      maxPoolPct = 1.0,
    } = params;

    if (accountBalanceUsd <= 0 || poolLiquidityUsd <= 0 || finalScore <= 0) {
      return {
        positionSizeUsd: 0,
        sizingFactor: 0,
        reason: 'Zero balance, liquidity, or final score',
      };
    }

    // Baseline size from account risk allocation (e.g., $10,000 * 2% = $200)
    const baseAllocationUsd = accountBalanceUsd * (maxAccountRiskPct / 100);

    // Multipliers
    const scoreFactor = Math.min(1, Math.max(0, finalScore / 100));
    const confidenceFactor = Math.min(1, Math.max(0, confidenceScore / 100));
    const riskDiscount = Math.max(0.2, 1 - riskScore / 100);

    const sizingFactor = scoreFactor * confidenceFactor * riskDiscount;
    let computedSizeUsd = baseAllocationUsd * sizingFactor;

    // Pool Liquidity Cap (Never trade > 1% of pool to prevent excessive slippage)
    const maxPoolCapUsd = poolLiquidityUsd * (maxPoolPct / 100);
    const cappedByPool = computedSizeUsd > maxPoolCapUsd;

    if (cappedByPool) {
      computedSizeUsd = maxPoolCapUsd;
    }

    const finalSizeUsd = Math.max(10, Math.round(computedSizeUsd * 100) / 100);

    return {
      positionSizeUsd: finalSizeUsd,
      sizingFactor: Number(sizingFactor.toFixed(3)),
      reason: cappedByPool
        ? `Capped at 1% pool liquidity ($${maxPoolCapUsd.toFixed(0)})`
        : `Risk-adjusted (${(sizingFactor * 100).toFixed(0)}% optimal conviction)`,
    };
  }
}
