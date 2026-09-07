import { Decision } from '@meme-coin/types';
import {
  BacktestEngine,
  BacktestConfig,
  BacktestSimulationSignal,
} from './backtest-engine.js';
import { BacktestSummaryMetrics } from './backtest-metrics-calculator.js';

export interface ParameterSweepGrid {
  scoreThresholds: number[];       // e.g. [65, 70, 75, 80]
  riskThresholds: number[];        // e.g. [25, 35, 45]
  horizons: Array<'1m' | '3m' | '5m' | '10m' | '30m' | '1h'>;
  takeProfits?: number[];          // e.g. [30, 50, 100]
  stopLosses?: number[];           // e.g. [-10, -15, -20]
}

export interface SweepResultItem {
  parameters: {
    minFinalScore: number;
    maxRiskScore: number;
    horizon: string;
    takeProfitPct?: number;
    stopLossPct?: number;
  };
  metrics: BacktestSummaryMetrics;
}

export class ParameterSweepEngine {
  /**
   * Runs parameter sweep across multiple strategy threshold combinations.
   */
  static runSweep(
    baseConfig: Omit<BacktestConfig, 'strategy'>,
    grid: ParameterSweepGrid,
    signalsWithOutcomes: Array<{
      signal: BacktestSimulationSignal;
      outcomePrices: any;
    }>
  ): SweepResultItem[] {
    const results: SweepResultItem[] = [];

    for (const scoreThresh of grid.scoreThresholds) {
      for (const riskThresh of grid.riskThresholds) {
        for (const horizon of grid.horizons) {
          const strat = {
            name: `Sweep-S${scoreThresh}-R${riskThresh}-${horizon}`,
            minFinalScore: scoreThresh,
            maxRiskScore: riskThresh,
            minConfidenceScore: 65,
            allowedDecisions: [
              Decision.PAPER_TRADE_CANDIDATE,
              Decision.HIGH_PRIORITY,
              Decision.ALERT,
            ],
            horizon,
            takeProfitPct: grid.takeProfits ? grid.takeProfits[0] : 50,
            stopLossPct: grid.stopLosses ? grid.stopLosses[0] : -15,
            positionSizeUsd: 200,
          };

          const runConfig: BacktestConfig = {
            ...baseConfig,
            name: strat.name,
            strategy: strat,
          };

          const runResult = BacktestEngine.runSimulation(runConfig, signalsWithOutcomes);

          results.push({
            parameters: {
              minFinalScore: scoreThresh,
              maxRiskScore: riskThresh,
              horizon,
              takeProfitPct: strat.takeProfitPct,
              stopLossPct: strat.stopLossPct,
            },
            metrics: runResult.metrics,
          });
        }
      }
    }

    // Sort by Sharpe Ratio descending
    results.sort((a, b) => b.metrics.sharpeRatio - a.metrics.sharpeRatio);

    return results;
  }
}
