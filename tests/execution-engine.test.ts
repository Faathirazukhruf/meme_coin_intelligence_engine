import { describe, it, expect, beforeEach } from 'vitest';
import {
  SlippageModel,
  PositionSizer,
  ExecutionSimulator,
  PaperPortfolioManager,
} from '@meme-coin/core';

describe('Paper Execution & Simulation Engine Tests (PRD Section 17 & 21)', () => {
  describe('Slippage & Price Impact Model', () => {
    it('computes realistic low slippage for small order in deep liquidity', () => {
      const { slippagePct, priceImpactPct, isExcessive } = SlippageModel.estimateSlippage({
        tradeSizeUsd: 100,
        poolLiquidityUsd: 100000,
      });

      expect(priceImpactPct).toBeLessThan(0.1);
      expect(slippagePct).toBeLessThan(1.5);
      expect(isExcessive).toBe(false);
    });

    it('flags high slippage and excessive price impact for large order in thin liquidity', () => {
      const { slippagePct, priceImpactPct, isExcessive } = SlippageModel.estimateSlippage({
        tradeSizeUsd: 2000,
        poolLiquidityUsd: 5000, // 40% of pool
      });

      expect(priceImpactPct).toBeGreaterThan(15);
      expect(slippagePct).toBeGreaterThan(15);
      expect(isExcessive).toBe(true);
    });

    it('applies slippage correctly to buy and sell fills', () => {
      const marketPrice = 1.0;
      const slippagePct = 2.0;

      const buyFill = SlippageModel.applySlippageToPrice(marketPrice, slippagePct, 'BUY');
      expect(buyFill).toBe(1.02);

      const sellFill = SlippageModel.applySlippageToPrice(marketPrice, slippagePct, 'SELL');
      expect(sellFill).toBe(0.98);
    });
  });

  describe('Position Sizer', () => {
    it('scales position size with conviction and discounts by risk score', () => {
      const highConviction = PositionSizer.calculatePositionSize({
        accountBalanceUsd: 10000,
        finalScore: 85,
        riskScore: 15,
        confidenceScore: 90,
        poolLiquidityUsd: 100000,
        maxAccountRiskPct: 2.0, // $200 max base
      });

      const lowConviction = PositionSizer.calculatePositionSize({
        accountBalanceUsd: 10000,
        finalScore: 50,
        riskScore: 50,
        confidenceScore: 60,
        poolLiquidityUsd: 100000,
        maxAccountRiskPct: 2.0,
      });

      expect(highConviction.positionSizeUsd).toBeGreaterThan(lowConviction.positionSizeUsd);
      expect(highConviction.positionSizeUsd).toBeGreaterThan(100);
    });

    it('caps position size to max pool liquidity percentage (1% max)', () => {
      const sizing = PositionSizer.calculatePositionSize({
        accountBalanceUsd: 500000,
        finalScore: 95,
        riskScore: 10,
        confidenceScore: 95,
        poolLiquidityUsd: 10000, // Small pool: $10,000 * 1% = $100 cap
        maxAccountRiskPct: 5.0,  // $25,000 base
        maxPoolPct: 1.0,
      });

      expect(sizing.positionSizeUsd).toBe(100);
      expect(sizing.reason).toContain('Capped at 1% pool liquidity');
    });
  });

  describe('Execution Simulator & Paper Portfolio Manager', () => {
    let manager: PaperPortfolioManager;

    beforeEach(() => {
      manager = new PaperPortfolioManager(10000);
    });

    it('simulates order entry with realistic latency, slippage, and fees', () => {
      const sim = ExecutionSimulator.simulateEntry({
        signalId: 'sig-sim-1',
        tokenId: 'tok-sol-test',
        marketPrice: 0.05,
        poolLiquidityUsd: 50000,
        positionSizeUsd: 250,
      });

      expect(sim.status).toBe('FILLED');
      expect(sim.simulatedEntryPrice).toBeGreaterThan(0.05); // Slippage increases buy price
      expect(sim.estimatedFeeUsd).toBeGreaterThan(0);
      expect(sim.entryLatencyMs).toBe(800);
    });

    it('executes full paper trading lifecycle with Take-Profit trigger (+50%)', () => {
      const pos = manager.openPosition(
        {
          signalId: 'sig-tp-1',
          tokenId: 'tok-tp-test',
          marketPrice: 1.0,
          poolLiquidityUsd: 100000,
          positionSizeUsd: 200,
        },
        { takeProfitPct: 50, stopLossPct: -15 }
      );

      expect(manager.getPositions('FILLED').length).toBe(1);
      const summaryInitial = manager.getSummary();
      expect(summaryInitial.currentCashUsd).toBe(9800); // 10000 - 200

      // Price surges to 1.60 (+60%) -> Should trigger TP
      const evalRes = manager.evaluatePriceUpdate(pos.id, 1.60, 100000);
      expect(evalRes.triggeredExit).toBe('TP');

      const summaryAfter = manager.getSummary();
      expect(summaryAfter.totalTrades).toBe(1);
      expect(summaryAfter.winningTrades).toBe(1);
      expect(summaryAfter.winRate).toBe(100);
      expect(summaryAfter.realizedPnlUsd).toBeGreaterThan(80);
      expect(summaryAfter.currentCashUsd).toBeGreaterThan(10000); // Profit added back
    });

    it('executes full paper trading lifecycle with Stop-Loss trigger (-15%)', () => {
      const pos = manager.openPosition(
        {
          signalId: 'sig-sl-1',
          tokenId: 'tok-sl-test',
          marketPrice: 1.0,
          poolLiquidityUsd: 100000,
          positionSizeUsd: 200,
        },
        { takeProfitPct: 50, stopLossPct: -15 }
      );

      // Price plunges to 0.80 (-20%) -> Should trigger SL
      const evalRes = manager.evaluatePriceUpdate(pos.id, 0.80, 100000);
      expect(evalRes.triggeredExit).toBe('SL');

      const summaryAfter = manager.getSummary();
      expect(summaryAfter.totalTrades).toBe(1);
      expect(summaryAfter.winningTrades).toBe(0);
      expect(summaryAfter.winRate).toBe(0);
      expect(summaryAfter.realizedPnlUsd).toBeLessThan(0);
    });
  });
});
