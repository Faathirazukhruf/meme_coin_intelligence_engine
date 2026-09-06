import { describe, it, expect } from 'vitest';
import { FeatureCalculator, FeatureEngine, HistoricalSnapshotsContext } from '@meme-coin/core';
import {
  MarketSnapshotEntity,
  HolderSnapshotEntity,
  SocialSnapshotEntity,
} from '@meme-coin/types';

describe('Feature Engine V1 & Anti-Look-Ahead Tests (PRD Section 10, 11, 16)', () => {
  const T0 = new Date('2026-09-06T12:00:00.000Z');
  const T_minus_1m = new Date(T0.getTime() - 60 * 1000);
  const T_minus_3m = new Date(T0.getTime() - 3 * 60 * 1000);
  const T_minus_5m = new Date(T0.getTime() - 5 * 60 * 1000);
  const T_minus_10m = new Date(T0.getTime() - 10 * 60 * 1000);

  const baseMarket: MarketSnapshotEntity = {
    id: 'm-cur',
    tokenId: 'tok-1',
    timestamp: T0,
    price: 0.0003,
    marketCap: 300000,
    fdv: 300000,
    liquidity: 30000,
    volume1m: 1500,
    volume5m: 6000,
    volume15m: 15000,
    buyVolume: 10000,
    sellVolume: 5000,
    buyCount: 12,
    sellCount: 4,
    txCount: 16,
    dataQuality: 95,
  };

  const baseHolder: HolderSnapshotEntity = {
    id: 'h-cur',
    tokenId: 'tok-1',
    timestamp: T0,
    holderCount: 120,
    top10Concentration: 0.35,
    top20Concentration: 0.48,
    top50Concentration: 0.65,
    creatorRatio: 0.04,
    dataQuality: 90,
  };

  const baseSocial: SocialSnapshotEntity = {
    id: 's-cur',
    tokenId: 'tok-1',
    timestamp: T0,
    mentionCount: 25,
    uniqueAuthors: 18,
    engagement: 450,
    authorGrowth: 0.2,
    mentionVelocity: 1.5,
    engagementVelocity: 15,
    dataCompleteness: 85,
  };

  const validContext: HistoricalSnapshotsContext = {
    currentMarket: baseMarket,
    market1m: { ...baseMarket, id: 'm-1m', timestamp: T_minus_1m, price: 0.00028, volume1m: 1000, liquidity: 28000 },
    market3m: { ...baseMarket, id: 'm-3m', timestamp: T_minus_3m, price: 0.00025 },
    market5m: { ...baseMarket, id: 'm-5m', timestamp: T_minus_5m, price: 0.00022, volume5m: 4000, liquidity: 25000 },
    market10m: { ...baseMarket, id: 'm-10m', timestamp: T_minus_10m, price: 0.00020 },

    currentHolder: baseHolder,
    holder1m: { ...baseHolder, id: 'h-1m', timestamp: T_minus_1m, holderCount: 110 },
    holder5m: { ...baseHolder, id: 'h-5m', timestamp: T_minus_5m, holderCount: 80 },

    currentSocial: baseSocial,
  };

  describe('Feature Calculator Domain Groups', () => {
    it('computes Market features (returns and regime) correctly', () => {
      const marketFeatures = FeatureCalculator.computeMarketFeatures(validContext);
      expect(marketFeatures.priceReturn1m).toBeCloseTo((0.0003 - 0.00028) / 0.00028, 4);
      expect(marketFeatures.priceReturn5m).toBeCloseTo((0.0003 - 0.00022) / 0.00022, 4);
      expect(marketFeatures.marketRegime).toBe('TRENDING_UP');
    });

    it('computes Volume features (velocity, acceleration, buy pressure, imbalance) correctly', () => {
      const volFeatures = FeatureCalculator.computeVolumeFeatures(validContext);
      expect(volFeatures.volume1m).toBe(1500);
      expect(volFeatures.volume5m).toBe(6000);
      expect(volFeatures.buyPressure).toBeCloseTo(10000 / 15000, 4);
      expect(volFeatures.buySellImbalance).toBeCloseTo(5000 / 15000, 4);
      expect(volFeatures.volumeLiquidityRatio).toBeCloseTo(6000 / 30000, 4);
      expect(volFeatures.volumeVelocity1m).toBe(500); // (1500 - 1000) / 1
    });

    it('computes Liquidity features correctly', () => {
      const liqFeatures = FeatureCalculator.computeLiquidityFeatures(validContext);
      expect(liqFeatures.liquidity).toBe(30000);
      expect(liqFeatures.liquidityGrowth1m).toBeGreaterThan(0);
      expect(liqFeatures.liquidityMarketcapRatio).toBeCloseTo(30000 / 300000, 4);
    });

    it('computes Holder features (growth, velocity, acceleration) correctly', () => {
      const holderFeatures = FeatureCalculator.computeHolderFeatures(validContext);
      expect(holderFeatures.holderCount).toBe(120);
      expect(holderFeatures.holderGrowth1m).toBeGreaterThan(0);
      expect(holderFeatures.holderVelocity).toBe(10); // (120 - 110) / 1
      expect(holderFeatures.top10Concentration).toBe(0.35);
    });

    it('computes Wallet, Social, and Narrative feature groups', () => {
      const all = FeatureCalculator.computeAll(validContext);
      expect(all.walletDev.creatorRatio).toBe(0.04);
      expect(all.social.uniqueAuthorRatio).toBeCloseTo(18 / 25, 4);
      expect(all.narrative.tokenNarrativeAlignment).toBe(0.5);
    });
  });

  describe('Anti-Look-Ahead Enforcement & Versioning', () => {
    it('successfully computes feature vector when all inputs are <= T0', async () => {
      const engine = new FeatureEngine();
      const result = await engine.computeFeatures({
        tokenId: 'tok-1',
        anchorTimestamp: T0,
        context: validContext,
      });

      expect(result.tokenId).toBe('tok-1');
      expect(result.featureVersion).toBe('feature_v1');
      expect(result.features.market).toBeDefined();
      expect(result.features.volume).toBeDefined();
      expect(result.features.liquidity).toBeDefined();
      expect(result.features.holder).toBeDefined();
    });

    it('strictly rejects any snapshot from the future (timestamp > T0)', async () => {
      const engine = new FeatureEngine();
      const futureMarket: MarketSnapshotEntity = {
        ...baseMarket,
        timestamp: new Date(T0.getTime() + 1000), // Future snapshot (+1s after T0)
      };

      const futureContext: HistoricalSnapshotsContext = {
        ...validContext,
        currentMarket: futureMarket,
      };

      await expect(
        engine.computeFeatures({
          tokenId: 'tok-1',
          anchorTimestamp: T0,
          context: futureContext,
        })
      ).rejects.toThrowError(/Anti-Look-Ahead violation/);
    });
  });
});
