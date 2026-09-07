import {
  Decision,
  HardVetoResult,
  RiskBreakdown,
  OpportunityBreakdown,
  ScoreResult,
} from '@meme-coin/types';
import { DecisionThresholdsConfig, DEFAULT_DECISION_THRESHOLDS } from '@meme-coin/config';
import { normalizeMinMax } from '@meme-coin/math';

export interface DecisionEvaluationParams {
  tokenId: string;
  hardVeto: HardVetoResult;
  risk: RiskBreakdown;
  opportunity: OpportunityBreakdown;
  confidenceScore: number;
  scoringVersion: string;
  thresholds?: DecisionThresholdsConfig;
}

export class DecisionEngine {
  /**
   * Evaluates Risk-Adjusted Final Score and classifies into actionable Decision (PRD Section 13 & 23).
   */
  static evaluate(params: DecisionEvaluationParams): {
    scoreResult: ScoreResult;
    decision: Decision;
    reason: string;
  } {
    const thresholds = params.thresholds || DEFAULT_DECISION_THRESHOLDS;
    const { hardVeto, risk, opportunity, confidenceScore, scoringVersion, tokenId } = params;

    // Calculate Risk Multiplier in [0, 1]
    const riskPenalty = risk.totalRiskScore / 100;
    const riskMultiplier = Math.max(0, Math.min(1, 1 - riskPenalty));
    const finalScore = normalizeMinMax(opportunity.totalOpportunityScore * riskMultiplier, 0, 100, 0, 100);

    const scoreResult: ScoreResult = {
      id: `score-${tokenId}-${Date.now()}`,
      tokenId,
      timestamp: new Date(),
      hardVeto,
      risk,
      opportunity,
      riskMultiplier,
      finalScore,
      confidenceScore,
      scoringVersion,
    };

    // 1. Hard Veto Guard - Absolute Priority
    if (hardVeto.isVetoed) {
      return {
        scoreResult,
        decision: Decision.IGNORE,
        reason: `Vetoed: ${hardVeto.reason || 'CRITICAL_RISK'} - Unsafe for research/trading.`,
      };
    }

    // 2. Classify Decision based on thresholds & confidence
    let decision: Decision = Decision.IGNORE;
    const reasons: string[] = [];

    if (
      finalScore >= thresholds.paperTradeMinFinalScore &&
      risk.totalRiskScore <= 35 &&
      confidenceScore >= 75
    ) {
      decision = Decision.PAPER_TRADE_CANDIDATE;
      reasons.push('Exceptional risk-adjusted momentum with high data reliability');
    } else if (
      finalScore >= thresholds.highPriorityMinFinalScore &&
      risk.totalRiskScore <= 40 &&
      confidenceScore >= thresholds.minConfidenceScore
    ) {
      decision = Decision.HIGH_PRIORITY;
      reasons.push('Strong momentum setup with low structural risk');
    } else if (
      finalScore >= thresholds.alertMinFinalScore &&
      risk.totalRiskScore <= thresholds.maxRiskScoreForAlert &&
      confidenceScore >= thresholds.minConfidenceScore
    ) {
      decision = Decision.ALERT;
      reasons.push('Solid volume and momentum crossing threshold');
    } else if (finalScore >= 40) {
      decision = Decision.WATCH;
      reasons.push('Moderate momentum, placed on watchlist for observation');
    } else {
      decision = Decision.IGNORE;
      reasons.push('Sub-threshold momentum or excessive risk');
    }

    // Append feature drivers to reason for explainability
    if (opportunity.volumeMomentum > 65) reasons.push('high volume velocity');
    if (opportunity.holderMomentum > 65) reasons.push('rapid holder onboarding');
    if (risk.devRisk < 30) reasons.push('safe dev allocation');
    if (risk.holderRisk > 70) reasons.push('warning: elevated top-10 concentration');

    const reason = reasons.join(' + ');

    return {
      scoreResult,
      decision,
      reason,
    };
  }
}
