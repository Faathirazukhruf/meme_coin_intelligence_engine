import { DetectedNarrativeMatch } from './narrative-cluster-engine.js';
import { SocialMetricsResult } from '../social/social-velocity-calculator.js';

export interface TokenNarrativeSummary {
  headline: string;
  narrativeThemes: string[];
  socialActivitySummary: string;
  botSpamWarning: boolean;
  bulletPoints: string[];
}

export class NarrativeSummarizer {
  /**
   * Generates a concise, deterministic human-readable summary
   * explaining narrative fit and social momentum (PRD Section 22).
   */
  static generateSummary(
    tokenSymbol: string,
    narratives: DetectedNarrativeMatch[],
    social: SocialMetricsResult
  ): TokenNarrativeSummary {
    const narrativeNames = narratives.map((n) => n.name);
    const primaryNarrative = narrativeNames[0] || 'General Meme Culture';

    const headline = `${tokenSymbol} riding ${primaryNarrative} momentum with ${social.mentionVelocity} mentions/min`;

    const bulletPoints: string[] = [
      `Categorized under: ${narrativeNames.join(', ') || 'Uncategorized Meme'}`,
      `Social velocity: ${social.mentionVelocity} mentions/min with ${social.uniqueAuthors} distinct authors (${(social.uniqueAuthorRatio * 100).toFixed(0)}% organic ratio)`,
    ];

    if (social.isBotSpamSuspected) {
      bulletPoints.push(
        '⚠️ Warning: Potential bot raid detected (< 25% unique author ratio). On-chain volume should be prioritized over social chatter.'
      );
    } else {
      bulletPoints.push('✅ Organic discussion detected across multiple independent accounts.');
    }

    return {
      headline,
      narrativeThemes: narrativeNames,
      socialActivitySummary: `${social.mentionCount} mentions in recent window across ${social.uniqueAuthors} accounts`,
      botSpamWarning: social.isBotSpamSuspected,
      bulletPoints,
    };
  }
}
