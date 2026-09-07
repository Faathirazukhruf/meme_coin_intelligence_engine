export interface FeatureOutcomeObservation {
  featureValue: number;
  forwardReturnPct: number;
}

export interface FeatureICResult {
  featureName: string;
  horizon: string;
  sampleCount: number;
  pearsonIC: number;   // Linear correlation [-1, 1]
  spearmanIC: number;  // Rank correlation [-1, 1]
  predictiveStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'NO_SIGNAL';
}

export class InformationCoefficientAnalyzer {
  /**
   * Computes Pearson and Spearman Rank Information Coefficient (IC) between a feature and forward return.
   */
  static computeFeatureIC(
    featureName: string,
    horizon: string,
    observations: FeatureOutcomeObservation[]
  ): FeatureICResult {
    if (!observations || observations.length < 5) {
      return {
        featureName,
        horizon,
        sampleCount: observations?.length ?? 0,
        pearsonIC: 0,
        spearmanIC: 0,
        predictiveStrength: 'NO_SIGNAL',
      };
    }

    const n = observations.length;
    const x = observations.map((o) => o.featureValue);
    const y = observations.map((o) => o.forwardReturnPct);

    // 1. Pearson Correlation
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const valX = x[i] ?? 0;
      const valY = y[i] ?? 0;
      const dx = valX - meanX;
      const dy = valY - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const pearsonIC = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;

    // 2. Spearman Rank Correlation
    const rankX = this.getRankArray(x);
    const rankY = this.getRankArray(y);

    let rankD2 = 0;
    for (let i = 0; i < n; i++) {
      const rx = rankX[i] ?? 0;
      const ry = rankY[i] ?? 0;
      rankD2 += Math.pow(rx - ry, 2);
    }
    const spearmanIC = 1 - (6 * rankD2) / (n * (Math.pow(n, 2) - 1));

    // Evaluate Predictive Strength
    const absIC = Math.abs(spearmanIC);
    let predictiveStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'NO_SIGNAL' = 'NO_SIGNAL';
    if (absIC >= 0.15) predictiveStrength = 'STRONG';
    else if (absIC >= 0.08) predictiveStrength = 'MODERATE';
    else if (absIC >= 0.03) predictiveStrength = 'WEAK';

    return {
      featureName,
      horizon,
      sampleCount: n,
      pearsonIC: Number(pearsonIC.toFixed(3)),
      spearmanIC: Number(spearmanIC.toFixed(3)),
      predictiveStrength,
    };
  }

  /**
   * Helper to convert an array of values to fractional ranks.
   */
  private static getRankArray(values: number[]): number[] {
    const sorted = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(values.length);
    for (let r = 0; r < sorted.length; r++) {
      const item = sorted[r];
      if (item) {
        ranks[item.i] = r + 1;
      }
    }
    return ranks;
  }
}
