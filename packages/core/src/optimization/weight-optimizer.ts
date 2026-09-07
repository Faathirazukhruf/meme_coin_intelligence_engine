import { RiskWeightsConfig, OpportunityWeightsConfig } from '@meme-coin/config';
import { FeatureICResult } from './information-coefficient-analyzer.js';

export class WeightOptimizer {
  /**
   * Calculates optimized Opportunity Weights based on empirical IC ranking
   * enforcing minimum floor weights and normalizing to sum = 1.0.
   */
  static optimizeOpportunityWeights(
    icResults: FeatureICResult[]
  ): OpportunityWeightsConfig {
    const defaultWeights: OpportunityWeightsConfig = {
      marketMomentum: 0.20,
      volumeMomentum: 0.20,
      liquidityMomentum: 0.15,
      holderMomentum: 0.15,
      socialMomentum: 0.15,
      narrativeMomentum: 0.15,
    };

    if (!icResults || icResults.length === 0) {
      return defaultWeights;
    }

    // Map feature ICs to components
    const icMap: Record<string, number> = {};
    for (const res of icResults) {
      icMap[res.featureName] = Math.max(0.01, Math.abs(res.spearmanIC));
    }

    const rawWeights = {
      marketMomentum: icMap['priceReturn5m'] ?? 0.20,
      volumeMomentum: icMap['volumeVelocity1m'] ?? 0.20,
      liquidityMomentum: icMap['liquidityGrowth5m'] ?? 0.15,
      holderMomentum: icMap['holderGrowth5m'] ?? 0.15,
      socialMomentum: icMap['mentionVelocity'] ?? 0.15,
      narrativeMomentum: icMap['narrativeVelocity'] ?? 0.15,
    };

    // Apply minimum floor (0.05) and maximum cap (0.35)
    const floored = {
      marketMomentum: Math.min(0.35, Math.max(0.05, rawWeights.marketMomentum)),
      volumeMomentum: Math.min(0.35, Math.max(0.05, rawWeights.volumeMomentum)),
      liquidityMomentum: Math.min(0.35, Math.max(0.05, rawWeights.liquidityMomentum)),
      holderMomentum: Math.min(0.35, Math.max(0.05, rawWeights.holderMomentum)),
      socialMomentum: Math.min(0.35, Math.max(0.05, rawWeights.socialMomentum)),
      narrativeMomentum: Math.min(0.35, Math.max(0.05, rawWeights.narrativeMomentum)),
    };

    const sum = Object.values(floored).reduce((a, b) => a + b, 0);

    return {
      marketMomentum: Number((floored.marketMomentum / sum).toFixed(3)),
      volumeMomentum: Number((floored.volumeMomentum / sum).toFixed(3)),
      liquidityMomentum: Number((floored.liquidityMomentum / sum).toFixed(3)),
      holderMomentum: Number((floored.holderMomentum / sum).toFixed(3)),
      socialMomentum: Number((floored.socialMomentum / sum).toFixed(3)),
      narrativeMomentum: Number((floored.narrativeMomentum / sum).toFixed(3)),
    };
  }

  /**
   * Calculates optimized Risk Weights with safety guardrails.
   */
  static optimizeRiskWeights(
    historicalRugStats?: { devDumpRatio?: number; clusterRiskRatio?: number }
  ): RiskWeightsConfig {
    const base: RiskWeightsConfig = {
      liquidityRisk: 0.20,
      holderRisk: 0.15,
      devRisk: 0.20,
      walletRisk: 0.20,
      marketStructureRisk: 0.15,
      contractRisk: 0.10,
    };

    if (!historicalRugStats) return base;

    // If dev dump is the primary cause of rugs, increase dev risk weighting
    if ((historicalRugStats.devDumpRatio ?? 0) > 0.6) {
      base.devRisk = 0.25;
      base.walletRisk = 0.20;
      base.marketStructureRisk = 0.10;
    }

    const sum = Object.values(base).reduce((a, b) => a + b, 0);
    return {
      liquidityRisk: Number((base.liquidityRisk / sum).toFixed(3)),
      holderRisk: Number((base.holderRisk / sum).toFixed(3)),
      devRisk: Number((base.devRisk / sum).toFixed(3)),
      walletRisk: Number((base.walletRisk / sum).toFixed(3)),
      marketStructureRisk: Number((base.marketStructureRisk / sum).toFixed(3)),
      contractRisk: Number((base.contractRisk / sum).toFixed(3)),
    };
  }
}
