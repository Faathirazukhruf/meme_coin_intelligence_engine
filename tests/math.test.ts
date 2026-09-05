import { describe, it, expect } from 'vitest';
import {
  calculateReturn,
  calculateLogReturn,
  calculateBuyPressure,
  calculateBuySellImbalance,
  calculateVolumeVelocity,
  calculateVolumeAcceleration,
  calculateVolumeLiquidityRatio,
  calculateTopNConcentration,
  calculateCreatorRatio,
  calculateDevSellPressure,
  normalizeMinMax,
  calculatePercentileRank,
} from '@meme-coin/math';

describe('Math Engine Unit Tests', () => {
  describe('Returns', () => {
    it('calculates simple return accurately', () => {
      expect(calculateReturn(120, 100)).toBeCloseTo(0.2);
      expect(calculateReturn(80, 100)).toBeCloseTo(-0.2);
      expect(calculateReturn(100, 0)).toBe(0);
    });

    it('calculates log returns accurately', () => {
      expect(calculateLogReturn(Math.E, 1)).toBeCloseTo(1);
      expect(calculateLogReturn(1, 1)).toBe(0);
    });
  });

  describe('Volume & Order Flow', () => {
    it('calculates buy pressure bounded in [0, 1]', () => {
      expect(calculateBuyPressure(75, 25)).toBe(0.75);
      expect(calculateBuyPressure(0, 100)).toBe(0);
      expect(calculateBuyPressure(100, 0)).toBe(1);
      expect(calculateBuyPressure(0, 0)).toBe(0.5); // Default neutral
    });

    it('calculates buy/sell imbalance bounded in [-1, 1]', () => {
      expect(calculateBuySellImbalance(75, 25)).toBe(0.5);
      expect(calculateBuySellImbalance(25, 75)).toBe(-0.5);
      expect(calculateBuySellImbalance(0, 0)).toBe(0);
    });

    it('calculates volume velocity and acceleration', () => {
      const v1 = calculateVolumeVelocity(1000, 400, 5); // 600 / 5 = 120
      expect(v1).toBe(120);

      const v2 = calculateVolumeVelocity(2000, 1000, 5); // 1000 / 5 = 200
      expect(calculateVolumeAcceleration(v2, v1)).toBe(80);
    });

    it('calculates volume to liquidity ratio', () => {
      expect(calculateVolumeLiquidityRatio(50000, 100000)).toBe(0.5);
      expect(calculateVolumeLiquidityRatio(50000, 0)).toBe(0);
    });
  });

  describe('Concentration and Creator Risk', () => {
    it('calculates top N concentration', () => {
      const topBalances = [1000, 2000, 3000];
      const circulating = 10000;
      expect(calculateTopNConcentration(topBalances, circulating)).toBe(0.6);
    });

    it('calculates creator ratio and dev sell pressure', () => {
      expect(calculateCreatorRatio(500, 10000)).toBe(0.05);
      expect(calculateDevSellPressure(200, 1000)).toBe(0.2);
    });
  });

  describe('Normalization', () => {
    it('scales value into min/max range', () => {
      expect(normalizeMinMax(50, 0, 100, 0, 100)).toBe(50);
      expect(normalizeMinMax(150, 0, 100, 0, 100)).toBe(100); // Clamped
      expect(normalizeMinMax(-20, 0, 100, 0, 100)).toBe(0);   // Clamped
    });

    it('calculates percentile rank correctly', () => {
      const dataset = [10, 20, 30, 40, 50];
      expect(calculatePercentileRank(30, dataset)).toBe(50);
      expect(calculatePercentileRank(5, dataset)).toBe(0);
      expect(calculatePercentileRank(60, dataset)).toBe(100);
    });
  });
});
