export interface SocialMetricsResult {
  mentionCount: number;
  uniqueAuthors: number;
  uniqueAuthorRatio: number; // 0 to 1 (Low = Bot raid spam, High = Organic discussion)
  totalEngagement: number;
  mentionVelocity: number;   // mentions / min
  engagementVelocity: number; // engagement / min
  isBotSpamSuspected: boolean; // true if uniqueAuthorRatio < 0.25 with > 20 mentions
}

export class SocialVelocityCalculator {
  /**
   * Computes quantitative social velocity and bot-raid spam metrics (PRD Section 11 & 19).
   */
  static computeVelocity(
    events: Array<{ authorId: string; createdAt: Date; engagement?: number }>,
    windowMinutes: number = 15
  ): SocialMetricsResult {
    if (!events || events.length === 0 || windowMinutes <= 0) {
      return {
        mentionCount: 0,
        uniqueAuthors: 0,
        uniqueAuthorRatio: 1.0,
        totalEngagement: 0,
        mentionVelocity: 0,
        engagementVelocity: 0,
        isBotSpamSuspected: false,
      };
    }

    const mentionCount = events.length;
    const authorSet = new Set(events.map((e) => e.authorId));
    const uniqueAuthors = authorSet.size;

    const uniqueAuthorRatio = Number((uniqueAuthors / mentionCount).toFixed(2));
    const totalEngagement = events.reduce((acc, e) => acc + (e.engagement ?? 0), 0);

    const mentionVelocity = Number((mentionCount / windowMinutes).toFixed(2));
    const engagementVelocity = Number((totalEngagement / windowMinutes).toFixed(2));

    // Bot spam heuristic: High mentions from very few accounts
    const isBotSpamSuspected = mentionCount >= 15 && uniqueAuthorRatio < 0.25;

    return {
      mentionCount,
      uniqueAuthors,
      uniqueAuthorRatio,
      totalEngagement,
      mentionVelocity,
      engagementVelocity,
      isBotSpamSuspected,
    };
  }
}
