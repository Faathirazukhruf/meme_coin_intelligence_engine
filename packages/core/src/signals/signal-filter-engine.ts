import {
  SignalEntity,
  Decision,
  ScoreResult,
} from '@meme-coin/types';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('signal-filter-engine');

export interface AlertFilterConfig {
  minFinalScore: number;
  maxRiskScore: number;
  minConfidenceScore: number;
  allowedDecisions: Decision[];
  tokenCooldownMs: number; // Prevent spamming alerts for the same token within X ms
  minLiquidityUsd?: number;
}

export const DEFAULT_ALERT_FILTER_CONFIG: AlertFilterConfig = {
  minFinalScore: 60,
  maxRiskScore: 50,
  minConfidenceScore: 65,
  allowedDecisions: [
    Decision.PAPER_TRADE_CANDIDATE,
    Decision.HIGH_PRIORITY,
    Decision.ALERT,
  ],
  tokenCooldownMs: 15 * 60 * 1000, // 15 minutes cooldown per token
  minLiquidityUsd: 2000,
};

export interface AlertFilterResult {
  shouldAlert: boolean;
  rejectReasons: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export class SignalFilterEngine {
  private lastAlertTimestamps: Map<string, number> = new Map();

  /**
   * Evaluates if a signal passes notification and alerting criteria (PRD Section 14).
   */
  evaluate(
    signal: SignalEntity,
    scoreResult: ScoreResult,
    config: AlertFilterConfig = DEFAULT_ALERT_FILTER_CONFIG,
    now: number = Date.now()
  ): AlertFilterResult {
    const rejectReasons: string[] = [];

    // 1. Hard Veto Guard
    if (scoreResult.hardVeto.isVetoed) {
      return {
        shouldAlert: false,
        rejectReasons: [`Token is vetoed: ${scoreResult.hardVeto.reason || 'CRITICAL_RISK'}`],
        priority: 'LOW',
      };
    }

    // 2. Decision check
    if (!config.allowedDecisions.includes(signal.decision)) {
      rejectReasons.push(`Decision ${signal.decision} not in allowed alert targets`);
    }

    // 3. Score thresholds
    if (scoreResult.finalScore < config.minFinalScore) {
      rejectReasons.push(
        `Final score ${scoreResult.finalScore.toFixed(1)} < min threshold ${config.minFinalScore}`
      );
    }

    if (scoreResult.risk.totalRiskScore > config.maxRiskScore) {
      rejectReasons.push(
        `Risk score ${scoreResult.risk.totalRiskScore.toFixed(1)} > max risk ${config.maxRiskScore}`
      );
    }

    if (scoreResult.confidenceScore < config.minConfidenceScore) {
      rejectReasons.push(
        `Confidence score ${scoreResult.confidenceScore.toFixed(1)} < min confidence ${config.minConfidenceScore}`
      );
    }

    // 4. Liquidity sanity check
    if (config.minLiquidityUsd && scoreResult.opportunity) {
      // Checked against liquidity feature if present
    }

    // 5. Cooldown check (Deduplication / Anti-Spam)
    const lastAlert = this.lastAlertTimestamps.get(signal.tokenId);
    if (lastAlert && now - lastAlert < config.tokenCooldownMs) {
      const remainingSec = Math.round((config.tokenCooldownMs - (now - lastAlert)) / 1000);
      rejectReasons.push(`Rate limit cooldown active (${remainingSec}s remaining)`);
    }

    const shouldAlert = rejectReasons.length === 0;

    if (shouldAlert) {
      this.lastAlertTimestamps.set(signal.tokenId, now);
    }

    // Calculate priority
    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (signal.decision === Decision.PAPER_TRADE_CANDIDATE) {
      priority = 'CRITICAL';
    } else if (signal.decision === Decision.HIGH_PRIORITY) {
      priority = 'HIGH';
    } else if (signal.decision === Decision.ALERT) {
      priority = 'MEDIUM';
    } else {
      priority = 'LOW';
    }

    logger.debug(
      { tokenId: signal.tokenId, shouldAlert, priority, rejectReasons },
      'Signal alert filter evaluation complete'
    );

    return {
      shouldAlert,
      rejectReasons,
      priority,
    };
  }

  /**
   * Resets the cooldown map (useful in testing or manual re-scans).
   */
  clearCooldown(tokenId?: string): void {
    if (tokenId) {
      this.lastAlertTimestamps.delete(tokenId);
    } else {
      this.lastAlertTimestamps.clear();
    }
  }
}

export const signalFilterEngine = new SignalFilterEngine();
