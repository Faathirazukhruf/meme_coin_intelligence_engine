import { describe, it, expect } from 'vitest';
import {
  HardVetoEngine,
  RiskEngine,
  OpportunityEngine,
  ConfidenceEngine,
  DecisionEngine,
  ScoringOrchestrator,
} from '@meme-coin/core';
import { FeatureVector, Decision } from '@meme-coin/types';

describe('Scoring, Risk, Opportunity & Decision Engine Tests (PRD Section 12, 13, 18-23)', () => {
  const sampleFeatures: FeatureVector = {
    market: {
      priceReturn1m: 0.05,
      priceReturn3m: 0.12,
      priceReturn5m: 0.20,
      priceReturn10m: 0.35,
      marketRegime: 'TRENDING_UP',
    },
    volume: {
      volume1m: 10000,
      volume5m: 45000,
      volumeVelocity1m: 2000,
      volumeVelocity5m: 5000,
      volumeAcceleration: 3000,
      volumeLiquidityRatio: 0.45,
      buyPressure: 0.78,
      buySellImbalance: 0.56,
    },
    liquidity: {
      liquidity: 100000,
      liquidityGrowth1m: 0.08,
      liquidityGrowth5m: 0.25,
      liquidityMarketcapRatio: 0.15,
      liquidityVolatility: 0.05,
    },
    holder: {
      holderCount: 450,
      holderGrowth1m: 0.06,
      holderGrowth5m: 0.22,
      holderVelocity: 15,
      holderAcceleration: 5,
      top10Concentration: 0.18,
      top20Concentration: 0.28,
    },
    walletDev: {
      creatorRatio: 0.02,
      devSellPressure: 0.05,
      creatorActivity: 1,
      clusterConcentration: 0.08,
      earlyWalletConcentration: 0.12,
    },
    social: {
      mentionCount: 85,
      uniqueAuthors: 60,
      mentionVelocity: 5.2,
      authorVelocity: 0.35,
      uniqueAuthorRatio: 0.70,
      engagementVelocity: 45,
    },
    narrative: {
      narrativeMentions: 120,
      narrativeVelocity: 4.5,
      narrativeAcceleration: 1.2,
      tokenNarrativeAlignment: 0.85,
    },
  };

  describe('Hard Veto Layer (Zero Tolerance Safety Invariants)', () => {
    it('vetoes honeypot and unsellable contracts unconditionally', () => {
      const honeypotVeto = HardVetoEngine.evaluateVeto({
        features: sampleFeatures,
        contractAudit: { isHoneypot: true },
      });
      expect(honeypotVeto.isVetoed).toBe(true);
      expect(honeypotVeto.reason).toBe('HONEYPOT');

      const taxVeto = HardVetoEngine.evaluateVeto({
        features: sampleFeatures,
        contractAudit: { hasTransferTaxExcessive: true },
      });
      expect(taxVeto.isVetoed).toBe(true);
      expect(taxVeto.reason).toBe('UNSELLABLE');
    });

    it('vetoes tokens with drained liquidity (< $500)', () => {
      const drainedFeatures: FeatureVector = {
        ...sampleFeatures,
        liquidity: { ...sampleFeatures.liquidity, liquidity: 250 },
      };

      const veto = HardVetoEngine.evaluateVeto({
        features: drainedFeatures,
      });
      expect(veto.isVetoed).toBe(true);
      expect(veto.reason).toBe('LIQUIDITY_REMOVED');
    });

    it('vetoes tokens with insufficient data quality score (< 20)', () => {
      const veto = HardVetoEngine.evaluateVeto({
        features: sampleFeatures,
        dataQualityScore: 10,
      });
      expect(veto.isVetoed).toBe(true);
      expect(veto.reason).toBe('INSUFFICIENT_DATA');
    });
  });

  describe('Risk Engine (0 - 100, Higher = More Risky)', () => {
    it('computes low risk for safe distribution, low creator ratio, and deep liquidity', () => {
      const risk = RiskEngine.computeRisk({ features: sampleFeatures });
      expect(risk.totalRiskScore).toBeLessThan(40);
      expect(risk.liquidityRisk).toBeLessThan(35);
      expect(risk.devRisk).toBeLessThan(25);
      expect(risk.holderRisk).toBeLessThan(35);
    });

    it('computes high risk when creator ratio and concentration are elevated', () => {
      const dangerousFeatures: FeatureVector = {
        ...sampleFeatures,
        liquidity: { ...sampleFeatures.liquidity, liquidity: 3500 },
        holder: { ...sampleFeatures.holder, top10Concentration: 0.85, top20Concentration: 0.95 },
        walletDev: {
          ...sampleFeatures.walletDev,
          creatorRatio: 0.60,
          devSellPressure: 0.90,
          clusterConcentration: 0.70,
          earlyWalletConcentration: 0.75,
        },
      };

      const risk = RiskEngine.computeRisk({ features: dangerousFeatures, contractRiskScore: 70 });
      expect(risk.totalRiskScore).toBeGreaterThan(60);
      expect(risk.devRisk).toBeGreaterThan(70);
      expect(risk.holderRisk).toBeGreaterThan(75);
    });
  });

  describe('Opportunity Engine (0 - 100, Higher = Better Momentum)', () => {
    it('computes strong momentum for high volume velocity and holder growth', () => {
      const opp = OpportunityEngine.computeOpportunity({ features: sampleFeatures });
      expect(opp.totalOpportunityScore).toBeGreaterThan(70);
      expect(opp.marketMomentum).toBeGreaterThan(60);
      expect(opp.volumeMomentum).toBeGreaterThan(70);
      expect(opp.holderMomentum).toBeGreaterThan(65);
    });
  });

  describe('Confidence Engine', () => {
    it('computes high confidence for full sample size and high data completeness', () => {
      const conf = ConfidenceEngine.computeConfidence({
        dataCompleteness: 95,
        tradeSampleCount: 30,
        timeInWindowSec: 600,
        hasMultiSourceAgreement: true,
      });
      expect(conf).toBeGreaterThanOrEqual(85);
    });
  });

  describe('Decision Engine & Explainability', () => {
    it('veto strictly forces Decision = IGNORE even with maximum opportunity', () => {
      const risk = RiskEngine.computeRisk({ features: sampleFeatures });
      const opp = OpportunityEngine.computeOpportunity({ features: sampleFeatures });

      const res = DecisionEngine.evaluate({
        tokenId: 'tok-veto-test',
        hardVeto: { isVetoed: true, reason: 'HONEYPOT' },
        risk,
        opportunity: opp,
        confidenceScore: 90,
        scoringVersion: 'scoring_v1',
      });

      expect(res.decision).toBe(Decision.IGNORE);
      expect(res.reason).toMatch(/Vetoed: HONEYPOT/);
    });

    it('classifies high momentum setup into PAPER_TRADE_CANDIDATE with explainable reasons', () => {
      const risk = RiskEngine.computeRisk({ features: sampleFeatures });
      const opp = OpportunityEngine.computeOpportunity({ features: sampleFeatures });

      const res = DecisionEngine.evaluate({
        tokenId: 'tok-alpha-1',
        hardVeto: { isVetoed: false },
        risk,
        opportunity: opp,
        confidenceScore: 85,
        scoringVersion: 'scoring_v1',
      });

      expect(res.decision).toBe(Decision.PAPER_TRADE_CANDIDATE);
      expect(res.scoreResult.finalScore).toBeGreaterThan(75);
      expect(res.reason).toContain('high volume velocity');
    });
  });

  describe('Scoring Orchestrator', () => {
    it('runs end-to-end scoring pipeline returning ScoreResult and Signal', async () => {
      const orchestrator = new ScoringOrchestrator();
      const output = await orchestrator.scoreToken({
        tokenId: 'tok-e2e-1',
        features: sampleFeatures,
        dataQualityScore: 90,
        tradeSampleCount: 25,
      });

      expect(output.scoreResult).toBeDefined();
      expect(output.scoreResult.finalScore).toBeGreaterThan(0);
      expect(output.signal).toBeDefined();
      expect(output.signal?.status).toBe('ACTIVE');
    });
  });
});
