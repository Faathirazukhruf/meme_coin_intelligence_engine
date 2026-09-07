export type MarketRegime = 'TRENDING_UP' | 'CHOPPY' | 'HIGH_VOLATILITY' | 'MARKET_DRAWDOWN';

export interface DriftReport {
  featureName: string;
  referenceMean: number;
  currentMean: number;
  driftPct: number;
  isDriftDetected: boolean;
}

export interface RegimeAssessment {
  currentRegime: MarketRegime;
  solanaMemeHealthScore: number; // 0 to 100
  driftDetected: boolean;
  driftReports: DriftReport[];
  recommendation: string;
}

export class DriftDetector {
  /**
   * Compares recent feature distributions against baseline reference distributions (PRD Section 20 & 24).
   */
  static assessRegime(
    baselineMetrics: { avgVolume5m: number; avgLiquidity: number; avgBuyPressure: number },
    currentMetrics: { avgVolume5m: number; avgLiquidity: number; avgBuyPressure: number },
    driftThresholdPct: number = 35
  ): RegimeAssessment {
    const driftReports: DriftReport[] = [];

    // 1. Volume Drift
    const volDrift =
      ((currentMetrics.avgVolume5m - baselineMetrics.avgVolume5m) / baselineMetrics.avgVolume5m) * 100;
    driftReports.push({
      featureName: 'Volume 5m',
      referenceMean: baselineMetrics.avgVolume5m,
      currentMean: currentMetrics.avgVolume5m,
      driftPct: Number(volDrift.toFixed(1)),
      isDriftDetected: Math.abs(volDrift) >= driftThresholdPct,
    });

    // 2. Liquidity Drift
    const liqDrift =
      ((currentMetrics.avgLiquidity - baselineMetrics.avgLiquidity) / baselineMetrics.avgLiquidity) * 100;
    driftReports.push({
      featureName: 'Pool Liquidity',
      referenceMean: baselineMetrics.avgLiquidity,
      currentMean: currentMetrics.avgLiquidity,
      driftPct: Number(liqDrift.toFixed(1)),
      isDriftDetected: Math.abs(liqDrift) >= driftThresholdPct,
    });

    // 3. Buy Pressure Drift
    const buyDrift =
      ((currentMetrics.avgBuyPressure - baselineMetrics.avgBuyPressure) /
        baselineMetrics.avgBuyPressure) *
      100;
    driftReports.push({
      featureName: 'Buy Pressure',
      referenceMean: baselineMetrics.avgBuyPressure,
      currentMean: currentMetrics.avgBuyPressure,
      driftPct: Number(buyDrift.toFixed(1)),
      isDriftDetected: Math.abs(buyDrift) >= driftThresholdPct,
    });

    const anyDrift = driftReports.some((r) => r.isDriftDetected);

    // Assess Regime
    let currentRegime: MarketRegime = 'TRENDING_UP';
    let solanaMemeHealthScore = 85;
    let recommendation = 'Optimal discovery conditions: standard momentum thresholds applied.';

    if (currentMetrics.avgBuyPressure < 0.45 && volDrift < -30) {
      currentRegime = 'MARKET_DRAWDOWN';
      solanaMemeHealthScore = 35;
      recommendation = 'Cautious mode: Increase minimum final score to 80 and tighten stop-loss to -10%.';
    } else if (volDrift > 50 && Math.abs(buyDrift) > 20) {
      currentRegime = 'HIGH_VOLATILITY';
      solanaMemeHealthScore = 75;
      recommendation = 'High volatility: Expect wider slippage, reduce maximum position size.';
    } else if (Math.abs(volDrift) < 20 && Math.abs(buyDrift) < 15) {
      currentRegime = 'CHOPPY';
      solanaMemeHealthScore = 60;
      recommendation = 'Choppy consolidation: Filter strictly for Paper Trade Candidates only.';
    }

    return {
      currentRegime,
      solanaMemeHealthScore,
      driftDetected: anyDrift,
      driftReports,
      recommendation,
    };
  }
}
