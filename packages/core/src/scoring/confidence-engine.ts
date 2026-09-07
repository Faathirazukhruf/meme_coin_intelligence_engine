import { normalizeMinMax } from '@meme-coin/math';

export interface ConfidenceInput {
  dataCompleteness: number; // 0-100 from snapshot data quality
  tradeSampleCount: number;  // Number of trades in sample
  timeInWindowSec: number;   // Observation window
  hasMultiSourceAgreement?: boolean;
}

export class ConfidenceEngine {
  /**
   * Computes Confidence score in [0, 100] (PRD Section 22).
   * Measures data quality and signal reliability, not model certainty.
   */
  static computeConfidence(input: ConfidenceInput): number {
    let score = input.dataCompleteness * 0.5;

    // Sample size contribution (up to 30%)
    if (input.tradeSampleCount >= 20) score += 30;
    else if (input.tradeSampleCount >= 10) score += 20;
    else if (input.tradeSampleCount >= 3) score += 10;

    // Observation stability (10%)
    if (input.timeInWindowSec >= 300) score += 10;
    else if (input.timeInWindowSec >= 60) score += 5;

    // Multi-source agreement bonus (10%)
    if (input.hasMultiSourceAgreement) score += 10;

    return normalizeMinMax(score, 0, 100, 0, 100);
  }
}
