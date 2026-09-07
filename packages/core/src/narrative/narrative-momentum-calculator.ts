export interface NarrativeMomentumResult {
  narrativeId: string;
  narrativeName: string;
  activeTokenCount: number;
  totalMentions: number;
  mentionVelocity: number;      // mentions / min in recent window
  mentionAcceleration: number;  // change in velocity vs prior window
  momentumScore: number;        // 0 to 100
  isTrending: boolean;          // true if momentumScore > 65 with positive acceleration
}

export class NarrativeMomentumCalculator {
  /**
   * Computes narrative velocity, acceleration, and composite momentum score (PRD Section 11 & 19).
   */
  static computeNarrativeMomentum(
    narrativeId: string,
    narrativeName: string,
    recentMentions: number,
    priorMentions: number,
    activeTokenCount: number,
    windowMinutes: number = 15
  ): NarrativeMomentumResult {
    const recentVelocity = recentMentions / windowMinutes;
    const priorVelocity = priorMentions / windowMinutes;

    const mentionAcceleration = Number((recentVelocity - priorVelocity).toFixed(2));
    const velocityNormalized = Math.min(60, recentVelocity * 8);
    const accelNormalized = Math.min(30, Math.max(-20, mentionAcceleration * 10));
    const tokenBreadth = Math.min(10, activeTokenCount * 2);

    const rawMomentum = velocityNormalized + accelNormalized + tokenBreadth;
    const momentumScore = Number(Math.min(100, Math.max(0, rawMomentum)).toFixed(1));

    const isTrending = momentumScore >= 60 && mentionAcceleration >= 0;

    return {
      narrativeId,
      narrativeName,
      activeTokenCount,
      totalMentions: recentMentions + priorMentions,
      mentionVelocity: Number(recentVelocity.toFixed(2)),
      mentionAcceleration,
      momentumScore,
      isTrending,
    };
  }
}
