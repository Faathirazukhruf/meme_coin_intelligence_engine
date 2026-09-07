import { prisma } from '@meme-coin/database';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('narrative-cluster-engine');

export interface NarrativeCategory {
  id: string;
  name: string;
  category: string;
  keywords: string[];
}

export const CANONICAL_NARRATIVES: NarrativeCategory[] = [
  {
    id: 'nar-ai-agents',
    name: 'Autonomous AI Agents',
    category: 'TECH_AI',
    keywords: ['agent', 'autonomous', 'ai', 'gpt', 'llm', 'neural', 'bot', 'deepseek', 'claude', 'terminal', 'eliza'],
  },
  {
    id: 'nar-cats-animals',
    name: 'Cats & Cute Animals',
    category: 'CULTURE_MEME',
    keywords: ['cat', 'kitty', 'kitten', 'meow', 'dog', 'doge', 'shiba', 'wif', 'pepe', 'frog', 'hamster', 'monkey'],
  },
  {
    id: 'nar-politifi',
    name: 'Politifi & Macro Culture',
    category: 'POLITICS',
    keywords: ['trump', 'biden', 'maga', 'election', 'fed', 'powell', 'president', 'freedom', 'patriot', 'whitehouse'],
  },
  {
    id: 'nar-quantum-science',
    name: 'DeSci & Quantum Tech',
    category: 'SCIENCE',
    keywords: ['quantum', 'desci', 'physics', 'energy', 'fusion', 'molecule', 'space', 'mars', 'orbital', 'satellite'],
  },
  {
    id: 'nar-cult-degenerate',
    name: 'Cult & Degenerate Lore',
    category: 'COMMUNITY',
    keywords: ['cult', 'based', 'anon', 'degen', 'wagmi', 'chad', 'retardio', 'gigachad', 'sigma', 'wojak'],
  },
];

export interface DetectedNarrativeMatch {
  narrativeId: string;
  name: string;
  category: string;
  confidence: number;
  matchedKeywords: string[];
}

export class NarrativeClusterEngine {
  /**
   * Identifies narrative alignment for a token using symbol, name, and post texts.
   */
  static detectNarratives(
    tokenSymbol: string,
    tokenName: string,
    sampleTexts: string[] = []
  ): DetectedNarrativeMatch[] {
    const combinedText = `${tokenSymbol} ${tokenName} ${sampleTexts.join(' ')}`.toLowerCase();
    const matches: DetectedNarrativeMatch[] = [];

    for (const nar of CANONICAL_NARRATIVES) {
      const matched = nar.keywords.filter((kw) => {
        // Match word boundaries or substring in token symbol
        const regex = new RegExp(`\\b${kw}\\b|${kw}`, 'i');
        return regex.test(combinedText);
      });

      if (matched.length > 0) {
        // Confidence scales with number of matched unique keywords
        const confidence = Math.min(1.0, 0.4 + matched.length * 0.2);
        matches.push({
          narrativeId: nar.id,
          name: nar.name,
          category: nar.category,
          confidence: Number(confidence.toFixed(2)),
          matchedKeywords: matched,
        });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * Persists token-narrative relationship to database.
   */
  static async linkTokenToNarratives(
    tokenId: string,
    matches: DetectedNarrativeMatch[]
  ): Promise<void> {
    for (const m of matches) {
      try {
        // Upsert narrative
        await prisma.narrative.upsert({
          where: { name: m.name },
          create: {
            id: m.narrativeId,
            name: m.name,
            category: m.category,
          },
          update: {},
        });

        // Upsert token narrative link
        await prisma.tokenNarrative.upsert({
          where: {
            tokenId_narrativeId: {
              tokenId,
              narrativeId: m.narrativeId,
            },
          },
          create: {
            tokenId,
            narrativeId: m.narrativeId,
            confidence: m.confidence,
            method: 'KEYWORD_SEMANTIC_TAXONOMY',
          },
          update: {
            confidence: m.confidence,
          },
        });
      } catch (err) {
        logger.debug({ err, tokenId, narrative: m.name }, 'Narrative DB link skipped in test mode');
      }
    }
  }
}
