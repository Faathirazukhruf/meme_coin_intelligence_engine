/**
 * Baseline V1 Scoring & Weight Configurations (PRD Section 12, 18, 20)
 * Note: These are experimental baselines and must remain configurable.
 */

export interface RiskWeightsConfig {
  liquidityRisk: number;       // 0.20 (20%)
  holderRisk: number;          // 0.15 (15%)
  devRisk: number;             // 0.20 (20%)
  walletRisk: number;          // 0.20 (20%)
  marketStructureRisk: number; // 0.15 (15%)
  contractRisk: number;        // 0.10 (10%)
}

export const DEFAULT_RISK_WEIGHTS: RiskWeightsConfig = {
  liquidityRisk: 0.20,
  holderRisk: 0.15,
  devRisk: 0.20,
  walletRisk: 0.20,
  marketStructureRisk: 0.15,
  contractRisk: 0.10,
};

export interface OpportunityWeightsConfig {
  marketMomentum: number;      // 0.20 (20%)
  volumeMomentum: number;      // 0.20 (20%)
  liquidityMomentum: number;   // 0.15 (15%)
  holderMomentum: number;      // 0.15 (15%)
  socialMomentum: number;      // 0.15 (15%)
  narrativeMomentum: number;   // 0.15 (15%)
}

export const DEFAULT_OPPORTUNITY_WEIGHTS: OpportunityWeightsConfig = {
  marketMomentum: 0.20,
  volumeMomentum: 0.20,
  liquidityMomentum: 0.15,
  holderMomentum: 0.15,
  socialMomentum: 0.15,
  narrativeMomentum: 0.15,
};

export interface DecisionThresholdsConfig {
  alertMinFinalScore: number;          // e.g. 60
  highPriorityMinFinalScore: number;   // e.g. 75
  paperTradeMinFinalScore: number;     // e.g. 80
  minConfidenceScore: number;          // e.g. 50
  maxRiskScoreForAlert: number;        // e.g. 50
}

export const DEFAULT_DECISION_THRESHOLDS: DecisionThresholdsConfig = {
  alertMinFinalScore: 60,
  highPriorityMinFinalScore: 75,
  paperTradeMinFinalScore: 80,
  minConfidenceScore: 50,
  maxRiskScoreForAlert: 50,
};
