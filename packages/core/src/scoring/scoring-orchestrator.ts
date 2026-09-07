import {
  FeatureVector,
  ScoreResult,
  SignalEntity,
} from '@meme-coin/types';
import { prisma } from '@meme-coin/database';
import { getConfig } from '@meme-coin/config';
import { createLogger } from '@meme-coin/utils';
import { HardVetoEngine, HardVetoContext } from './hard-veto-engine.js';
import { RiskEngine } from './risk-engine.js';
import { OpportunityEngine } from './opportunity-engine.js';
import { ConfidenceEngine, ConfidenceInput } from './confidence-engine.js';
import { DecisionEngine } from './decision-engine.js';

const logger = createLogger('scoring-orchestrator');

export interface FullScoringParams {
  tokenId: string;
  features: FeatureVector;
  dataQualityScore?: number;
  tradeSampleCount?: number;
  timeInWindowSec?: number;
  contractAudit?: HardVetoContext['contractAudit'];
}

export interface UnifiedScoringOutput {
  scoreResult: ScoreResult;
  signal: SignalEntity | null;
}

export class ScoringOrchestrator {
  /**
   * Orchestrates the complete evaluation pipeline:
   * Hard Veto -> Risk & Opportunity -> Final Score -> Confidence -> Decision & Signal
   */
  async scoreToken(params: FullScoringParams): Promise<UnifiedScoringOutput> {
    const config = getConfig();
    const scoringVersion = config.SCORING_VERSION || 'scoring_v1';

    // 1. Evaluate Hard Veto
    const hardVeto = HardVetoEngine.evaluateVeto({
      features: params.features,
      dataQualityScore: params.dataQualityScore,
      contractAudit: params.contractAudit,
    });

    // 2. Compute Risk Breakdown
    const risk = RiskEngine.computeRisk({
      features: params.features,
    });

    // 3. Compute Opportunity Breakdown
    const opportunity = OpportunityEngine.computeOpportunity({
      features: params.features,
    });

    // 4. Compute Confidence Score
    const confidenceInput: ConfidenceInput = {
      dataCompleteness: params.dataQualityScore ?? 80,
      tradeSampleCount: params.tradeSampleCount ?? 15,
      timeInWindowSec: params.timeInWindowSec ?? 300,
    };
    const confidenceScore = ConfidenceEngine.computeConfidence(confidenceInput);

    // 5. Evaluate Decision & Reasons
    const { scoreResult, decision, reason } = DecisionEngine.evaluate({
      tokenId: params.tokenId,
      hardVeto,
      risk,
      opportunity,
      confidenceScore,
      scoringVersion,
    });

    // 6. Generate Signal if decision is actionable
    let signal: SignalEntity | null = null;
    if (decision !== 'IGNORE') {
      signal = {
        id: `sig-${params.tokenId}-${Date.now()}`,
        tokenId: params.tokenId,
        timestamp: new Date(),
        signalType: 'MOMENTUM_DISCOVERY',
        scoreSnapshotId: scoreResult.id,
        decision,
        reason,
        status: 'ACTIVE',
      };
    }

    // 7. Persist to Database (when available)
    try {
      const savedScore = await prisma.scoreSnapshot.create({
        data: {
          tokenId: params.tokenId,
          timestamp: scoreResult.timestamp,
          riskScore: scoreResult.risk.totalRiskScore,
          marketScore: scoreResult.risk.marketStructureRisk,
          liquidityScore: scoreResult.risk.liquidityRisk,
          holderScore: scoreResult.risk.holderRisk,
          walletScore: scoreResult.risk.walletRisk,
          socialScore: scoreResult.opportunity.socialMomentum,
          narrativeScore: scoreResult.opportunity.narrativeMomentum,
          opportunityScore: scoreResult.opportunity.totalOpportunityScore,
          finalScore: scoreResult.finalScore,
          confidenceScore: scoreResult.confidenceScore,
          scoringVersion: scoreResult.scoringVersion,
          details: {
            hardVeto: scoreResult.hardVeto,
            risk: scoreResult.risk,
            opportunity: scoreResult.opportunity,
            riskMultiplier: scoreResult.riskMultiplier,
            reason,
          } as unknown as object,
        },
      });

      if (signal) {
        signal.scoreSnapshotId = savedScore.id;
        await prisma.signal.create({
          data: {
            tokenId: signal.tokenId,
            timestamp: signal.timestamp,
            signalType: signal.signalType,
            scoreSnapshotId: savedScore.id,
            decision: signal.decision,
            reason: signal.reason,
            status: signal.status,
          },
        });
      }
    } catch (err) {
      logger.debug({ err }, 'Scoring DB write skipped in memory test mode');
    }

    return {
      scoreResult,
      signal,
    };
  }
}

export const scoringOrchestrator = new ScoringOrchestrator();
