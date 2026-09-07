import { prisma } from '@meme-coin/database';
import { Decision, ScoreResult } from '@meme-coin/types';
import { createLogger } from '@meme-coin/utils';
import {
  BacktestMetricsCalculator,
  BacktestSummaryMetrics,
  TradeOutcomeRecord,
} from './backtest-metrics-calculator.js';
import { ExecutionSimulator } from '../execution/execution-simulator.js';

const logger = createLogger('backtest-engine');

export interface StrategyRules {
  name: string;
  minFinalScore: number;
  maxRiskScore: number;
  minConfidenceScore: number;
  allowedDecisions: Decision[];
  horizon: '1m' | '3m' | '5m' | '10m' | '30m' | '1h' | '6h' | '24h';
  takeProfitPct?: number; // e.g. 50%
  stopLossPct?: number;   // e.g. -15%
  positionSizeUsd?: number;
}

export interface BacktestConfig {
  name: string;
  description?: string;
  timeRangeStart: Date;
  timeRangeEnd: Date;
  strategy: StrategyRules;
  startingCapitalUsd?: number;
  datasetVersion?: string;
  featureVersion?: string;
  riskVersion?: string;
  opportunityVersion?: string;
  scoringVersion?: string;
  decisionVersion?: string;
  strategyVersion?: string;
  codeVersion?: string;
}

export interface BacktestSimulationSignal {
  tokenId: string;
  signalId?: string;
  anchorTimestamp: Date;
  anchorPrice: number;
  scoreResult: ScoreResult;
  decision: Decision;
}

export interface SimulatedTradeResult {
  tokenId: string;
  signalId?: string;
  anchorTimestamp: Date;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  pnlUsd: number;
  mfe: number;
  mae: number;
  scores: any;
  decision: string;
  exitReason: 'HORIZON' | 'TP' | 'SL';
}

export interface BacktestExecutionResult {
  id: string;
  config: BacktestConfig;
  metrics: BacktestSummaryMetrics;
  trades: SimulatedTradeResult[];
}

export class BacktestEngine {
  /**
   * Runs reproducible historical simulation over an array of historical signals and outcome price feeds.
   */
  static runSimulation(
    config: BacktestConfig,
    signalsWithOutcomes: Array<{
      signal: BacktestSimulationSignal;
      outcomePrices: {
        price1m?: number;
        price3m?: number;
        price5m?: number;
        price10m?: number;
        price30m?: number;
        price1h?: number;
        price6h?: number;
        price24h?: number;
        mfe?: number;
        mae?: number;
        poolLiquidityUsd?: number;
      };
    }>
  ): BacktestExecutionResult {
    const strat = config.strategy;
    const defaultPositionSize = strat.positionSizeUsd ?? 200;
    const trades: SimulatedTradeResult[] = [];
    const outcomeRecords: TradeOutcomeRecord[] = [];

    for (const item of signalsWithOutcomes) {
      const { signal, outcomePrices } = item;
      const score = signal.scoreResult;

      // 1. Filter against strategy rules
      if (score.hardVeto.isVetoed) continue;
      if (score.finalScore < strat.minFinalScore) continue;
      if (score.risk.totalRiskScore > strat.maxRiskScore) continue;
      if (score.confidenceScore < strat.minConfidenceScore) continue;
      if (!strat.allowedDecisions.includes(signal.decision)) continue;

      // 2. Determine Entry execution with simulated slippage & latency
      const poolLiquidity = outcomePrices.poolLiquidityUsd ?? 50000;
      const entrySim = ExecutionSimulator.simulateEntry({
        signalId: signal.signalId || `sig-${signal.tokenId}`,
        tokenId: signal.tokenId,
        marketPrice: signal.anchorPrice,
        poolLiquidityUsd: poolLiquidity,
        positionSizeUsd: defaultPositionSize,
      });

      const entryPrice = entrySim.simulatedEntryPrice;

      // 3. Determine Exit price based on Horizon, TP, or SL
      const horizonKey = `price${strat.horizon}` as keyof typeof outcomePrices;
      const targetHorizonPrice = outcomePrices[horizonKey] as number | undefined;

      if (!targetHorizonPrice || targetHorizonPrice <= 0) {
        continue;
      }

      let exitMarketPrice = targetHorizonPrice;
      let exitReason: 'HORIZON' | 'TP' | 'SL' = 'HORIZON';

      const mfe = outcomePrices.mfe ?? 0;
      const mae = outcomePrices.mae ?? 0;

      // Check if TP triggered during holding window
      if (strat.takeProfitPct && mfe >= strat.takeProfitPct) {
        exitMarketPrice = signal.anchorPrice * (1 + strat.takeProfitPct / 100);
        exitReason = 'TP';
      } else if (strat.stopLossPct && mae <= strat.stopLossPct) {
        exitMarketPrice = signal.anchorPrice * (1 + strat.stopLossPct / 100);
        exitReason = 'SL';
      }

      // Simulate exit fill
      const exitSim = ExecutionSimulator.simulateExit(
        entrySim,
        exitMarketPrice,
        poolLiquidity
      );

      const pnlUsd = exitSim.realizedPnlUsd ?? 0;
      const returnPct = exitSim.realizedReturnPct ?? 0;

      trades.push({
        tokenId: signal.tokenId,
        signalId: signal.signalId,
        anchorTimestamp: signal.anchorTimestamp,
        entryPrice,
        exitPrice: exitSim.simulatedExitPrice ?? exitMarketPrice,
        returnPct,
        pnlUsd,
        mfe,
        mae,
        scores: {
          finalScore: score.finalScore,
          riskScore: score.risk.totalRiskScore,
          opportunityScore: score.opportunity.totalOpportunityScore,
          confidenceScore: score.confidenceScore,
        },
        decision: signal.decision,
        exitReason,
      });

      outcomeRecords.push({
        entryPrice,
        exitPrice: exitSim.simulatedExitPrice ?? exitMarketPrice,
        returnPct,
        pnlUsd,
        mfe,
        mae,
      });
    }

    const metrics = BacktestMetricsCalculator.calculateMetrics(outcomeRecords);

    return {
      id: `bt-${Date.now()}`,
      config,
      metrics,
      trades,
    };
  }

  /**
   * Executes backtest by pulling historical records from PostgreSQL.
   */
  static async executeFromDatabase(config: BacktestConfig): Promise<BacktestExecutionResult> {
    const signals = await prisma.signal.findMany({
      where: {
        timestamp: {
          gte: config.timeRangeStart,
          lte: config.timeRangeEnd,
        },
      },
      include: {
        scoreSnapshot: true,
        outcomes: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    const formatted = (signals as any[]).map((s) => {
      const details = (s.scoreSnapshot.details as any) || {};
      const outcome = s.outcomes[0] || {};

      return {
        signal: {
          tokenId: s.tokenId,
          signalId: s.id,
          anchorTimestamp: s.timestamp,
          anchorPrice: outcome.anchorPrice ?? 0.001,
          scoreResult: {
            id: s.scoreSnapshot.id,
            tokenId: s.tokenId,
            timestamp: s.scoreSnapshot.timestamp,
            hardVeto: details.hardVeto || { isVetoed: false },
            risk: details.risk || { totalRiskScore: s.scoreSnapshot.riskScore },
            opportunity: details.opportunity || { totalOpportunityScore: s.scoreSnapshot.opportunityScore },
            riskMultiplier: details.riskMultiplier || 1,
            finalScore: s.scoreSnapshot.finalScore,
            confidenceScore: s.scoreSnapshot.confidenceScore,
            scoringVersion: s.scoreSnapshot.scoringVersion,
          },
          decision: s.decision as Decision,
        },
        outcomePrices: {
          price1m: outcome.price1m ?? undefined,
          price3m: outcome.price3m ?? undefined,
          price5m: outcome.price5m ?? undefined,
          price10m: outcome.price10m ?? undefined,
          price30m: outcome.price30m ?? undefined,
          price1h: outcome.price1h ?? undefined,
          price6h: outcome.price6h ?? undefined,
          price24h: outcome.price24h ?? undefined,
          mfe: outcome.mfe ?? 0,
          mae: outcome.mae ?? 0,
          poolLiquidityUsd: 50000,
        },
      };
    });

    const result = this.runSimulation(config, formatted);

    // Save to Database
    try {
      const savedBt = await prisma.backtest.create({
        data: {
          name: config.name,
          description: config.description,
          timeRangeStart: config.timeRangeStart,
          timeRangeEnd: config.timeRangeEnd,
          datasetVersion: config.datasetVersion || 'dataset_v1',
          featureVersion: config.featureVersion || 'feature_v1',
          riskVersion: config.riskVersion || 'risk_v1',
          opportunityVersion: config.opportunityVersion || 'opp_v1',
          scoringVersion: config.scoringVersion || 'scoring_v1',
          decisionVersion: config.decisionVersion || 'decision_v1',
          strategyVersion: config.strategyVersion || 'strat_v1',
          codeVersion: config.codeVersion || 'git_head',
          capitalAssumptions: {
            startingCapitalUsd: config.startingCapitalUsd || 10000,
            strategy: config.strategy,
          },
        },
      });

      const savedRun = await prisma.backtestRun.create({
        data: {
          backtestId: savedBt.id,
          status: 'COMPLETED',
          totalSignals: result.metrics.totalSignals,
          winRate: result.metrics.winRate,
          profitFactor: result.metrics.profitFactor,
          averageReturn: result.metrics.averageReturnPct,
          maxDrawdown: result.metrics.maxDrawdownPct,
          metrics: result.metrics as any,
        },
      });

      for (const t of result.trades.slice(0, 100)) {
        await prisma.backtestSignal.create({
          data: {
            backtestRunId: savedRun.id,
            tokenId: t.tokenId,
            signalId: t.signalId,
            anchorTimestamp: t.anchorTimestamp,
            entryPrice: t.entryPrice,
            exitPrice: t.exitPrice,
            scores: t.scores,
            decision: t.decision,
            simulatedPnl: t.pnlUsd,
            returnPct: t.returnPct,
            mfe: t.mfe,
            mae: t.mae,
          },
        });
      }
    } catch (err) {
      logger.debug({ err }, 'Prisma write skipped in memory test mode');
    }

    return result;
  }
}
