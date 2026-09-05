import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_OPPORTUNITY_WEIGHTS,
  DEFAULT_DECISION_THRESHOLDS,
} from '@meme-coin/config';

describe('Config & Baseline Weights Tests', () => {
  it('verifies baseline risk weights sum to 1.0 (100%)', () => {
    const sum =
      DEFAULT_RISK_WEIGHTS.liquidityRisk +
      DEFAULT_RISK_WEIGHTS.holderRisk +
      DEFAULT_RISK_WEIGHTS.devRisk +
      DEFAULT_RISK_WEIGHTS.walletRisk +
      DEFAULT_RISK_WEIGHTS.marketStructureRisk +
      DEFAULT_RISK_WEIGHTS.contractRisk;

    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('verifies baseline opportunity weights sum to 1.0 (100%)', () => {
    const sum =
      DEFAULT_OPPORTUNITY_WEIGHTS.marketMomentum +
      DEFAULT_OPPORTUNITY_WEIGHTS.volumeMomentum +
      DEFAULT_OPPORTUNITY_WEIGHTS.liquidityMomentum +
      DEFAULT_OPPORTUNITY_WEIGHTS.holderMomentum +
      DEFAULT_OPPORTUNITY_WEIGHTS.socialMomentum +
      DEFAULT_OPPORTUNITY_WEIGHTS.narrativeMomentum;

    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('verifies decision thresholds are monotonically ordered', () => {
    expect(DEFAULT_DECISION_THRESHOLDS.paperTradeMinFinalScore).toBeGreaterThanOrEqual(
      DEFAULT_DECISION_THRESHOLDS.highPriorityMinFinalScore
    );
    expect(DEFAULT_DECISION_THRESHOLDS.highPriorityMinFinalScore).toBeGreaterThanOrEqual(
      DEFAULT_DECISION_THRESHOLDS.alertMinFinalScore
    );
  });
});
