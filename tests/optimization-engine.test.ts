import { describe, it, expect } from 'vitest';
import {
  InformationCoefficientAnalyzer,
  WeightOptimizer,
  DriftDetector,
  FeatureOutcomeObservation,
} from '@meme-coin/core';

describe('Historical Optimization & Evidence-Based Tuning Tests (PRD Section 18-20, 24)', () => {
  describe('Information Coefficient (IC) Analyzer', () => {
    it('computes positive IC for strong monotonic predictive feature', () => {
      // Feature values positively correlated with forward returns
      const observations: FeatureOutcomeObservation[] = [
        { featureValue: 100, forwardReturnPct: 5 },
        { featureValue: 250, forwardReturnPct: 15 },
        { featureValue: 500, forwardReturnPct: 25 },
        { featureValue: 800, forwardReturnPct: 40 },
        { featureValue: 1200, forwardReturnPct: 60 },
        { featureValue: 2000, forwardReturnPct: 90 },
      ];

      const ic = InformationCoefficientAnalyzer.computeFeatureIC(
        'volumeVelocity1m',
        '5m',
        observations
      );

      expect(ic.pearsonIC).toBeGreaterThan(0.9);
      expect(ic.spearmanIC).toBeGreaterThan(0.9);
      expect(ic.predictiveStrength).toBe('STRONG');
    });

    it('computes negative IC for risk features (e.g. dev sell pressure)', () => {
      const observations: FeatureOutcomeObservation[] = [
        { featureValue: 0.1, forwardReturnPct: 30 },
        { featureValue: 0.3, forwardReturnPct: 10 },
        { featureValue: 0.5, forwardReturnPct: -5 },
        { featureValue: 0.7, forwardReturnPct: -25 },
        { featureValue: 0.9, forwardReturnPct: -50 },
      ];

      const ic = InformationCoefficientAnalyzer.computeFeatureIC(
        'devSellPressure',
        '5m',
        observations
      );

      expect(ic.spearmanIC).toBeLessThan(-0.8);
    });
  });

  describe('Weight Optimizer with Empirical Calibration', () => {
    it('optimizes opportunity weights ensuring total sum equals 1.0', () => {
      const icResults = [
        { featureName: 'volumeVelocity1m', horizon: '5m', sampleCount: 50, pearsonIC: 0.3, spearmanIC: 0.35, predictiveStrength: 'STRONG' as const },
        { featureName: 'priceReturn5m', horizon: '5m', sampleCount: 50, pearsonIC: 0.25, spearmanIC: 0.28, predictiveStrength: 'STRONG' as const },
        { featureName: 'holderGrowth5m', horizon: '5m', sampleCount: 50, pearsonIC: 0.2, spearmanIC: 0.22, predictiveStrength: 'STRONG' as const },
        { featureName: 'liquidityGrowth5m', horizon: '5m', sampleCount: 50, pearsonIC: 0.15, spearmanIC: 0.18, predictiveStrength: 'STRONG' as const },
        { featureName: 'mentionVelocity', horizon: '5m', sampleCount: 50, pearsonIC: 0.1, spearmanIC: 0.12, predictiveStrength: 'MODERATE' as const },
        { featureName: 'narrativeVelocity', horizon: '5m', sampleCount: 50, pearsonIC: 0.1, spearmanIC: 0.11, predictiveStrength: 'MODERATE' as const },
      ];

      const weights = WeightOptimizer.optimizeOpportunityWeights(icResults);
      const sum =
        weights.marketMomentum +
        weights.volumeMomentum +
        weights.liquidityMomentum +
        weights.holderMomentum +
        weights.socialMomentum +
        weights.narrativeMomentum;

      expect(sum).toBeCloseTo(1.0, 2);
      expect(weights.volumeMomentum).toBeGreaterThan(weights.socialMomentum);
    });

    it('adjusts risk weights when dev dumping is flagged in historical rug stats', () => {
      const riskWeights = WeightOptimizer.optimizeRiskWeights({ devDumpRatio: 0.75 });
      expect(riskWeights.devRisk).toBeGreaterThan(0.20);
      const sum = Object.values(riskWeights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });
  });

  describe('Drift & Regime Shift Detector', () => {
    it('accurately identifies market drawdown and generates protective recommendation', () => {
      const baseline = { avgVolume5m: 50000, avgLiquidity: 100000, avgBuyPressure: 0.65 };
      const distressed = { avgVolume5m: 20000, avgLiquidity: 40000, avgBuyPressure: 0.35 };

      const assessment = DriftDetector.assessRegime(baseline, distressed);

      expect(assessment.driftDetected).toBe(true);
      expect(assessment.currentRegime).toBe('MARKET_DRAWDOWN');
      expect(assessment.solanaMemeHealthScore).toBeLessThan(50);
      expect(assessment.recommendation).toContain('Cautious mode');
    });

    it('confirms trending up regime under healthy volume and buy pressure conditions', () => {
      const baseline = { avgVolume5m: 50000, avgLiquidity: 100000, avgBuyPressure: 0.65 };
      const healthy = { avgVolume5m: 65000, avgLiquidity: 115000, avgBuyPressure: 0.70 };

      const assessment = DriftDetector.assessRegime(baseline, healthy);

      expect(assessment.currentRegime).toBe('TRENDING_UP');
      expect(assessment.solanaMemeHealthScore).toBeGreaterThanOrEqual(80);
    });
  });
});
