import { describe, it, expect } from 'vitest';
import {
  BacktestEngine,
  BacktestConfig,
  BacktestSimulationSignal,
  BacktestMetricsCalculator,
  ParameterSweepEngine,
} from '@meme-coin/core';
import { Decision } from '@meme-coin/types';

describe('Backtest Engine & Research Simulator Tests (PRD Section 17, 20 & 21)', () => {
  const sampleSignals: Array<{
    signal: BacktestSimulationSignal;
    outcomePrices: any;
  }> = [
    {
      signal: {
        tokenId: 'tok-win-1',
        signalId: 'sig-1',
        anchorTimestamp: new Date('2026-09-01T12:00:00Z'),
        anchorPrice: 0.0010,
        scoreResult: {
          id: 'score-1',
          tokenId: 'tok-win-1',
          timestamp: new Date('2026-09-01T12:00:00Z'),
          hardVeto: { isVetoed: false },
          risk: {
            liquidityRisk: 15,
            holderRisk: 20,
            devRisk: 10,
            walletRisk: 15,
            marketStructureRisk: 20,
            contractRisk: 10,
            totalRiskScore: 15,
          },
          opportunity: {
            marketMomentum: 85,
            volumeMomentum: 90,
            liquidityMomentum: 80,
            holderMomentum: 85,
            socialMomentum: 70,
            narrativeMomentum: 75,
            totalOpportunityScore: 82,
          },
          riskMultiplier: 0.85,
          finalScore: 80,
          confidenceScore: 88,
          scoringVersion: 'scoring_v1',
        },
        decision: Decision.PAPER_TRADE_CANDIDATE,
      },
      outcomePrices: {
        price5m: 0.0016, // +60% gain
        mfe: 60,
        mae: -5,
        poolLiquidityUsd: 100000,
      },
    },
    {
      signal: {
        tokenId: 'tok-win-2',
        signalId: 'sig-2',
        anchorTimestamp: new Date('2026-09-02T14:00:00Z'),
        anchorPrice: 0.0020,
        scoreResult: {
          id: 'score-2',
          tokenId: 'tok-win-2',
          timestamp: new Date('2026-09-02T14:00:00Z'),
          hardVeto: { isVetoed: false },
          risk: {
            liquidityRisk: 20,
            holderRisk: 25,
            devRisk: 15,
            walletRisk: 18,
            marketStructureRisk: 22,
            contractRisk: 12,
            totalRiskScore: 18,
          },
          opportunity: {
            marketMomentum: 80,
            volumeMomentum: 85,
            liquidityMomentum: 75,
            holderMomentum: 80,
            socialMomentum: 65,
            narrativeMomentum: 70,
            totalOpportunityScore: 78,
          },
          riskMultiplier: 0.82,
          finalScore: 76,
          confidenceScore: 82,
          scoringVersion: 'scoring_v1',
        },
        decision: Decision.HIGH_PRIORITY,
      },
      outcomePrices: {
        price5m: 0.0028, // +40% gain
        mfe: 45,
        mae: -8,
        poolLiquidityUsd: 80000,
      },
    },
    {
      signal: {
        tokenId: 'tok-loss-1',
        signalId: 'sig-3',
        anchorTimestamp: new Date('2026-09-03T16:00:00Z'),
        anchorPrice: 0.0050,
        scoreResult: {
          id: 'score-3',
          tokenId: 'tok-loss-1',
          timestamp: new Date('2026-09-03T16:00:00Z'),
          hardVeto: { isVetoed: false },
          risk: {
            liquidityRisk: 30,
            holderRisk: 30,
            devRisk: 25,
            walletRisk: 25,
            marketStructureRisk: 30,
            contractRisk: 15,
            totalRiskScore: 28,
          },
          opportunity: {
            marketMomentum: 75,
            volumeMomentum: 75,
            liquidityMomentum: 70,
            holderMomentum: 75,
            socialMomentum: 60,
            narrativeMomentum: 65,
            totalOpportunityScore: 72,
          },
          riskMultiplier: 0.72,
          finalScore: 72,
          confidenceScore: 78,
          scoringVersion: 'scoring_v1',
        },
        decision: Decision.ALERT,
      },
      outcomePrices: {
        price5m: 0.0042, // -16% loss
        mfe: 5,
        mae: -20,
        poolLiquidityUsd: 40000,
      },
    },
    {
      signal: {
        tokenId: 'tok-vetoed',
        signalId: 'sig-4',
        anchorTimestamp: new Date('2026-09-04T18:00:00Z'),
        anchorPrice: 0.0001,
        scoreResult: {
          id: 'score-4',
          tokenId: 'tok-vetoed',
          timestamp: new Date('2026-09-04T18:00:00Z'),
          hardVeto: { isVetoed: true, reason: 'HONEYPOT' },
          risk: {
            liquidityRisk: 90,
            holderRisk: 90,
            devRisk: 90,
            walletRisk: 90,
            marketStructureRisk: 90,
            contractRisk: 90,
            totalRiskScore: 90,
          },
          opportunity: {
            marketMomentum: 90,
            volumeMomentum: 90,
            liquidityMomentum: 90,
            holderMomentum: 90,
            socialMomentum: 90,
            narrativeMomentum: 90,
            totalOpportunityScore: 90,
          },
          riskMultiplier: 0.1,
          finalScore: 9,
          confidenceScore: 90,
          scoringVersion: 'scoring_v1',
        },
        decision: Decision.IGNORE,
      },
      outcomePrices: {
        price5m: 0.00001,
        mfe: 0,
        mae: -90,
      },
    },
  ];

  const baseConfig: BacktestConfig = {
    name: 'Unit-Test-Backtest',
    timeRangeStart: new Date('2026-09-01T00:00:00Z'),
    timeRangeEnd: new Date('2026-09-05T00:00:00Z'),
    strategy: {
      name: 'Momentum-5m-Strategy',
      minFinalScore: 70,
      maxRiskScore: 30,
      minConfidenceScore: 75,
      allowedDecisions: [
        Decision.PAPER_TRADE_CANDIDATE,
        Decision.HIGH_PRIORITY,
        Decision.ALERT,
      ],
      horizon: '5m',
      takeProfitPct: 50,
      stopLossPct: -15,
      positionSizeUsd: 200,
    },
  };

  describe('Simulation Runner & Anti-Look-Ahead Filtering', () => {
    it('filters out vetoed tokens and tokens below score thresholds', () => {
      const result = BacktestEngine.runSimulation(baseConfig, sampleSignals);

      // Should trade tok-win-1, tok-win-2, tok-loss-1 (3 trades, vetoed ignored)
      expect(result.trades.length).toBe(3);
      expect(result.metrics.totalTrades).toBe(3);
      expect(result.metrics.winningTrades).toBe(2);
      expect(result.metrics.losingTrades).toBe(1);
      expect(result.metrics.winRate).toBeCloseTo(66.7, 1);
      expect(result.metrics.profitFactor).toBeGreaterThan(2.0);
      expect(result.metrics.sharpeRatio).toBeGreaterThan(0.5);
      expect(result.metrics.maxDrawdownPct).toBeLessThan(20);
    });

    it('enforces Stop-Loss and Take-Profit rules during simulation', () => {
      const result = BacktestEngine.runSimulation(baseConfig, sampleSignals);

      // tok-win-1 had MFE 60% with TP at 50% -> exitReason should be TP
      const trade1 = result.trades.find((t) => t.tokenId === 'tok-win-1');
      expect(trade1?.exitReason).toBe('TP');

      // tok-loss-1 had MAE -20% with SL at -15% -> exitReason should be SL
      const trade3 = result.trades.find((t) => t.tokenId === 'tok-loss-1');
      expect(trade3?.exitReason).toBe('SL');
    });
  });

  describe('Parameter Sweep & Grid Search', () => {
    it('executes grid search across combinations and sorts by Sharpe ratio', () => {
      const sweepResults = ParameterSweepEngine.runSweep(
        baseConfig,
        {
          scoreThresholds: [70, 75, 80],
          riskThresholds: [20, 30],
          horizons: ['5m'],
        },
        sampleSignals
      );

      expect(sweepResults.length).toBe(6); // 3 * 2 * 1
      expect(sweepResults[0].metrics.sharpeRatio).toBeGreaterThanOrEqual(
        sweepResults[sweepResults.length - 1].metrics.sharpeRatio
      );
    });
  });
});
