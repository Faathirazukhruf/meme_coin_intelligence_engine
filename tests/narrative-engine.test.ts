import { describe, it, expect } from 'vitest';
import {
  NarrativeClusterEngine,
  NarrativeMomentumCalculator,
  NarrativeSummarizer,
  SocialVelocityCalculator,
  SocialEventIngester,
} from '@meme-coin/core';

describe('Social & Narrative Enrichment Tests (PRD Section 11, 16 & 22)', () => {
  describe('Narrative Detection & Clustering', () => {
    it('accurately classifies AI agent tokens into Autonomous AI narrative', () => {
      const matches = NarrativeClusterEngine.detectNarratives(
        'ELIZA',
        'Autonomous Eliza Agent Framework',
        ['new deepseek llm terminal integrated with autonomous agent loop']
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].name).toBe('Autonomous AI Agents');
      expect(matches[0].category).toBe('TECH_AI');
      expect(matches[0].confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('accurately classifies cat meme tokens into Animals narrative', () => {
      const matches = NarrativeClusterEngine.detectNarratives(
        'MEOW',
        'Quantum Kitty Cat',
        ['cute kitten meme on solana pump fun']
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].name).toBe('Cats & Cute Animals');
      expect(matches[0].category).toBe('CULTURE_MEME');
    });
  });

  describe('Social Velocity & Bot Raid Spam Detection', () => {
    it('detects high-confidence organic discussion with diverse unique authors', () => {
      const now = new Date();
      // 20 mentions from 18 distinct authors
      const events = Array.from({ length: 20 }, (_, i) => ({
        authorId: `user-${i}`,
        createdAt: now,
        engagement: 5,
      }));

      const velocity = SocialVelocityCalculator.computeVelocity(events, 15);
      expect(velocity.mentionCount).toBe(20);
      expect(velocity.uniqueAuthors).toBe(20);
      expect(velocity.uniqueAuthorRatio).toBe(1.0);
      expect(velocity.isBotSpamSuspected).toBe(false);
      expect(velocity.mentionVelocity).toBeCloseTo(1.33, 1);
    });

    it('flags bot-raid spam when many mentions originate from very few authors', () => {
      const now = new Date();
      // 30 mentions from only 2 accounts (spambot raid)
      const events = Array.from({ length: 30 }, (_, i) => ({
        authorId: `bot-${i % 2}`,
        createdAt: now,
        engagement: 0,
      }));

      const velocity = SocialVelocityCalculator.computeVelocity(events, 15);
      expect(velocity.mentionCount).toBe(30);
      expect(velocity.uniqueAuthors).toBe(2);
      expect(velocity.uniqueAuthorRatio).toBeLessThan(0.15);
      expect(velocity.isBotSpamSuspected).toBe(true);
    });
  });

  describe('Narrative Momentum & AI-Assisted Summaries', () => {
    it('computes positive momentum and acceleration for rising narrative', () => {
      const momentum = NarrativeMomentumCalculator.computeNarrativeMomentum(
        'nar-ai-agents',
        'Autonomous AI Agents',
        250, // recent 15m
        100, // prior 15m (acceleration = +10 mentions/min)
        18,  // 18 active tokens
        15
      );

      expect(momentum.mentionAcceleration).toBeGreaterThan(0);
      expect(momentum.momentumScore).toBeGreaterThan(70);
      expect(momentum.isTrending).toBe(true);
    });

    it('generates structured explainability narrative summary with warnings when appropriate', () => {
      const narratives = NarrativeClusterEngine.detectNarratives('AI_DOGE', 'Autonomous Doge Agent');
      const social = SocialVelocityCalculator.computeVelocity(
        Array.from({ length: 10 }, (_, i) => ({ authorId: `user-${i}`, createdAt: new Date() })),
        15
      );

      const summary = NarrativeSummarizer.generateSummary('AI_DOGE', narratives, social);
      expect(summary.headline).toContain('AI_DOGE');
      expect(summary.headline).toContain('Autonomous AI Agents');
      expect(summary.bulletPoints.length).toBeGreaterThan(0);
      expect(summary.botSpamWarning).toBe(false);
    });
  });

  describe('Social Event Ingestion & Deduplication', () => {
    it('deduplicates identical social events using content hashes', async () => {
      const ingester = new SocialEventIngester();
      const rawEvent = {
        tokenId: 'tok-dedup-test',
        platform: 'X' as const,
        authorId: 'influencer-1',
        eventType: 'POST' as const,
        content: 'Check out this new solana gem $PEPE_SOL',
        createdAt: new Date(),
      };

      const first = await ingester.ingestEvent(rawEvent);
      expect(first.isDuplicate).toBe(false);

      const second = await ingester.ingestEvent(rawEvent);
      expect(second.isDuplicate).toBe(true);
    });
  });
});
