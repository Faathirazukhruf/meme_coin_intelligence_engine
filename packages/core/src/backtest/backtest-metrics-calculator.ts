export interface TradeOutcomeRecord {
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  pnlUsd: number;
  mfe?: number;
  mae?: number;
  holdingSec?: number;
}

export interface BacktestSummaryMetrics {
  totalSignals: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;            // %
  profitFactor: number;       // Gross Gains / Gross Losses
  averageReturnPct: number;   // %
  totalCumulativeReturnPct: number; // %
  maxDrawdownPct: number;     // %
  sharpeRatio: number;
  sortinoRatio: number;
  avgMfePct: number;          // %
  avgMaePct: number;          // %
  avgTradePnlUsd: number;
  totalPnlUsd: number;
}

export class BacktestMetricsCalculator {
  /**
   * Computes comprehensive quantitative performance and risk metrics (PRD Section 17 & 21).
   */
  static calculateMetrics(
    trades: TradeOutcomeRecord[],
    riskFreeRatePct: number = 0
  ): BacktestSummaryMetrics {
    if (!trades || trades.length === 0) {
      return {
        totalSignals: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        profitFactor: 0,
        averageReturnPct: 0,
        totalCumulativeReturnPct: 0,
        maxDrawdownPct: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        avgMfePct: 0,
        avgMaePct: 0,
        avgTradePnlUsd: 0,
        totalPnlUsd: 0,
      };
    }

    const n = trades.length;
    let grossGains = 0;
    let grossLosses = 0;
    let totalPnl = 0;
    let totalRet = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalMfe = 0;
    let totalMae = 0;

    const returns = trades.map((t) => t.returnPct);

    // Track cumulative equity curve for Max Drawdown calculation
    let currentEquity = 100;
    let peakEquity = 100;
    let maxDrawdown = 0;

    for (const t of trades) {
      totalPnl += t.pnlUsd;
      totalRet += t.returnPct;
      totalMfe += t.mfe ?? 0;
      totalMae += t.mae ?? 0;

      if (t.returnPct > 0) {
        winCount++;
        grossGains += t.pnlUsd;
      } else if (t.returnPct < 0) {
        lossCount++;
        grossLosses += Math.abs(t.pnlUsd);
      }

      // Equity curve update
      currentEquity *= 1 + t.returnPct / 100;
      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }
      const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }

    const winRate = (winCount / n) * 100;
    const profitFactor = grossLosses > 0 ? grossGains / grossLosses : grossGains > 0 ? 99.0 : 0;
    const avgReturn = totalRet / n;
    const totalCumReturn = (currentEquity - 100);

    // Standard Deviation of Returns
    const variance =
      returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);

    // Downside Deviation for Sortino Ratio (only negative returns)
    const downsideVariance =
      returns.reduce((acc, r) => acc + (r < riskFreeRatePct ? Math.pow(r - riskFreeRatePct, 2) : 0), 0) /
      (n > 1 ? n - 1 : 1);
    const downsideStdDev = Math.sqrt(downsideVariance);

    const sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRatePct) / stdDev : 0;
    const sortinoRatio = downsideStdDev > 0 ? (avgReturn - riskFreeRatePct) / downsideStdDev : 0;

    return {
      totalSignals: n,
      totalTrades: n,
      winningTrades: winCount,
      losingTrades: lossCount,
      winRate: Number(winRate.toFixed(1)),
      profitFactor: Number(profitFactor.toFixed(2)),
      averageReturnPct: Number(avgReturn.toFixed(2)),
      totalCumulativeReturnPct: Number(totalCumReturn.toFixed(2)),
      maxDrawdownPct: Number(maxDrawdown.toFixed(2)),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      sortinoRatio: Number(sortinoRatio.toFixed(2)),
      avgMfePct: Number((totalMfe / n).toFixed(1)),
      avgMaePct: Number((totalMae / n).toFixed(1)),
      avgTradePnlUsd: Number((totalPnl / n).toFixed(2)),
      totalPnlUsd: Number(totalPnl.toFixed(2)),
    };
  }
}
