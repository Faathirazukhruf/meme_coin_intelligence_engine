/**
 * Data Quality and Completeness Scorer (PRD Section 15 & 22)
 * Evaluates completeness and reliability on a scale of 0 to 100.
 */

export interface MarketDataQualityInput {
  hasPrice: boolean;
  hasLiquidity: boolean;
  hasVolume: boolean;
  tradeCount: number;
  timeSinceLastTradeSec: number;
}

export interface HolderDataQualityInput {
  holderCount: number;
  hasTopBalances: boolean;
  hasCirculatingSupply: boolean;
  topBalancesCount: number;
}

export interface SocialDataQualityInput {
  hasMentions: boolean;
  mentionCount: number;
  uniqueAuthors: number;
  hasEngagement: boolean;
}

export class DataQualityScorer {
  /**
   * Evaluates Market Snapshot Data Quality (0-100)
   */
  static evaluateMarketQuality(input: MarketDataQualityInput): number {
    let score = 0;

    // Price availability (30%)
    if (input.hasPrice) score += 30;

    // Liquidity availability (30%)
    if (input.hasLiquidity) score += 30;

    // Trade activity coverage (25%)
    if (input.tradeCount > 0) {
      score += 15;
      if (input.tradeCount >= 5) score += 10;
    }

    // Freshness penalty / bonus (15%)
    if (input.timeSinceLastTradeSec <= 300) {
      score += 15;
    } else if (input.timeSinceLastTradeSec <= 1800) {
      score += 8;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Evaluates Holder Snapshot Data Quality (0-100)
   */
  static evaluateHolderQuality(input: HolderDataQualityInput): number {
    let score = 0;

    if (input.hasCirculatingSupply) score += 35;
    if (input.holderCount > 0) {
      score += 25;
      if (input.holderCount >= 50) score += 15;
    }

    if (input.hasTopBalances && input.topBalancesCount >= 10) {
      score += 25;
    } else if (input.hasTopBalances) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Evaluates Social Snapshot Completeness (0-100)
   */
  static evaluateSocialCompleteness(input: SocialDataQualityInput): number {
    let score = 0;

    if (input.hasMentions && input.mentionCount > 0) {
      score += 40;
      if (input.mentionCount >= 10) score += 20;
    }

    if (input.uniqueAuthors > 0) {
      score += 20;
      if (input.uniqueAuthors >= 5) score += 10;
    }

    if (input.hasEngagement) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }
}
