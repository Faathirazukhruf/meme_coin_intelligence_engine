import { describe, it, expect } from 'vitest';
import {
  MarketSnapshotService,
  HolderSnapshotService,
  SocialSnapshotService,
  SnapshotOrchestrator,
  DataQualityScorer,
} from '@meme-coin/core';

describe('Snapshot Engine & Data Quality Tests (PRD Section 15)', () => {
  const now = new Date('2026-09-06T12:00:00.000Z');

  describe('Market Snapshot Calculations', () => {
    it('computes rolling volume windows (1m, 5m, 15m) and order flow accurately', async () => {
      const service = new MarketSnapshotService();
      const mockTrades = [
        {
          eventTime: new Date(now.getTime() - 30 * 1000), // 30s ago (1m, 5m, 15m)
          side: 'BUY',
          quoteAmount: 500,
        },
        {
          eventTime: new Date(now.getTime() - 120 * 1000), // 2m ago (5m, 15m)
          side: 'SELL',
          quoteAmount: 300,
        },
        {
          eventTime: new Date(now.getTime() - 400 * 1000), // ~6.6m ago (15m)
          side: 'BUY',
          quoteAmount: 200,
        },
      ];

      const snapshot = await service.computeSnapshot({
        tokenId: 'token-market-1',
        currentPrice: 0.00025,
        liquidity: 50000,
        timestamp: now,
        trades: mockTrades,
      });

      expect(snapshot.price).toBe(0.00025);
      expect(snapshot.liquidity).toBe(50000);
      expect(snapshot.volume1m).toBe(500);
      expect(snapshot.volume5m).toBe(800);
      expect(snapshot.volume15m).toBe(1000);
      expect(snapshot.buyVolume).toBe(700);
      expect(snapshot.sellVolume).toBe(300);
      expect(snapshot.buyCount).toBe(2);
      expect(snapshot.sellCount).toBe(1);
      expect(snapshot.txCount).toBe(3);
      expect(snapshot.dataQuality).toBeGreaterThan(70);
    });
  });

  describe('Holder Snapshot Calculations', () => {
    it('computes Top 10/20/50 concentration and creator ratio accurately', async () => {
      const service = new HolderSnapshotService();
      const balances = [
        100000, 90000, 80000, 70000, 60000,
        50000, 40000, 30000, 20000, 10000, // Top 10 = 550,000
        5000, 5000, 5000, 5000, 5000,
      ];
      const circulatingSupply = 1000000; // 1M

      const snapshot = await service.computeSnapshot({
        tokenId: 'token-holder-1',
        circulatingSupply,
        balances,
        creatorBalance: 50000,
        timestamp: now,
      });

      expect(snapshot.holderCount).toBe(15);
      expect(snapshot.top10Concentration).toBeCloseTo(0.55, 2);
      expect(snapshot.creatorRatio).toBeCloseTo(0.05, 2);
      expect(snapshot.dataQuality).toBeGreaterThan(60);
    });
  });

  describe('Social Snapshot Calculations', () => {
    it('computes attention growth and engagement velocity', async () => {
      const service = new SocialSnapshotService();
      const mentions = [
        { authorId: 'user_a', engagement: 50, createdAt: new Date(now.getTime() - 10000) },
        { authorId: 'user_b', engagement: 120, createdAt: new Date(now.getTime() - 20000) },
        { authorId: 'user_a', engagement: 30, createdAt: new Date(now.getTime() - 30000) },
      ];

      const snapshot = await service.computeSnapshot({
        tokenId: 'token-social-1',
        timestamp: now,
        mentions,
        previousSnapshot: {
          mentionCount: 1,
          uniqueAuthors: 1,
          engagement: 20,
          timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 mins ago
        },
      });

      expect(snapshot.mentionCount).toBe(3);
      expect(snapshot.uniqueAuthors).toBe(2);
      expect(snapshot.engagement).toBe(200);
      expect(snapshot.authorGrowth).toBeGreaterThan(0);
      expect(snapshot.mentionVelocity).toBeGreaterThan(0);
      expect(snapshot.engagementVelocity).toBeGreaterThan(0);
    });
  });

  describe('Data Quality Scoring', () => {
    it('evaluates high quality on rich data and penalizes missing fields', () => {
      const highQuality = DataQualityScorer.evaluateMarketQuality({
        hasPrice: true,
        hasLiquidity: true,
        hasVolume: true,
        tradeCount: 10,
        timeSinceLastTradeSec: 60,
      });
      expect(highQuality).toBe(100);

      const degradedQuality = DataQualityScorer.evaluateMarketQuality({
        hasPrice: true,
        hasLiquidity: false,
        hasVolume: false,
        tradeCount: 0,
        timeSinceLastTradeSec: 7200,
      });
      expect(degradedQuality).toBeLessThan(40);
    });
  });

  describe('Snapshot Orchestrator', () => {
    it('creates a synchronized unified snapshot bundle across domains', async () => {
      const orchestrator = new SnapshotOrchestrator();
      const bundle = await orchestrator.createSnapshotBundle(
        {
          tokenId: 'token-unified-1',
          currentPrice: 0.001,
          liquidity: 100000,
          timestamp: now,
          trades: [],
        },
        {
          tokenId: 'token-unified-1',
          circulatingSupply: 10000000,
          balances: [1000000, 500000],
          timestamp: now,
        },
        {
          tokenId: 'token-unified-1',
          timestamp: now,
          mentions: [],
        }
      );

      expect(bundle.tokenId).toBe('token-unified-1');
      expect(bundle.market).toBeDefined();
      expect(bundle.holder).toBeDefined();
      expect(bundle.social).toBeDefined();
      expect(bundle.averageQualityScore).toBeGreaterThanOrEqual(0);
      expect(bundle.averageQualityScore).toBeLessThanOrEqual(100);
    });
  });
});
