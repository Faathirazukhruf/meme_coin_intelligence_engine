import { describe, it, expect } from 'vitest';
import { OutcomeEvaluator, PricePoint } from '@meme-coin/core';

describe('Forward Outcome Tracking Engine Tests (PRD Section 17 & 21)', () => {
  const anchorTime = new Date('2026-09-07T10:00:00.000Z');
  const anchorPrice = 0.0010; // $0.0010 USD

  it('computes forward horizon returns and timestamps accurately', () => {
    // Generate simulated price points at 1m, 3m, 5m, 10m, 30m, 1h
    const pricePoints: PricePoint[] = [
      { timestamp: new Date('2026-09-07T10:01:00.000Z'), price: 0.0012, liquidity: 50000 }, // +20% @ 1m
      { timestamp: new Date('2026-09-07T10:03:00.000Z'), price: 0.0015, liquidity: 55000 }, // +50% @ 3m
      { timestamp: new Date('2026-09-07T10:05:00.000Z'), price: 0.0018, liquidity: 60000 }, // +80% @ 5m
      { timestamp: new Date('2026-09-07T10:10:00.000Z'), price: 0.0022, liquidity: 70000 }, // +120% @ 10m
      { timestamp: new Date('2026-09-07T10:30:00.000Z'), price: 0.0016, liquidity: 65000 }, // +60% @ 30m
      { timestamp: new Date('2026-09-07T11:00:00.000Z'), price: 0.0014, liquidity: 58000 }, // +40% @ 1h
    ];

    const outcome = OutcomeEvaluator.evaluate({
      tokenId: 'tok-sol-alpha',
      anchorTimestamp: anchorTime,
      anchorPrice,
      pricePoints,
      anchorLiquidity: 45000,
    });

    expect(outcome.anchorPrice).toBe(0.0010);
    expect(outcome.price1m?.returnPct).toBe(20);
    expect(outcome.price3m?.returnPct).toBe(50);
    expect(outcome.price5m?.returnPct).toBe(80);
    expect(outcome.price10m?.returnPct).toBe(120);
    expect(outcome.price30m?.returnPct).toBe(60);
    expect(outcome.price1h?.returnPct).toBe(40);
  });

  it('computes Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE)', () => {
    // Price dips to 0.0008 (-20%), then surges to 0.0025 (+150%), then settles at 0.0015 (+50%)
    const pricePoints: PricePoint[] = [
      { timestamp: new Date('2026-09-07T10:01:00.000Z'), price: 0.0008 }, // -20% (Drawdown)
      { timestamp: new Date('2026-09-07T10:03:00.000Z'), price: 0.0014 }, // +40%
      { timestamp: new Date('2026-09-07T10:08:00.000Z'), price: 0.0025 }, // +150% (Peak MFE)
      { timestamp: new Date('2026-09-07T10:15:00.000Z'), price: 0.0018 }, // +80%
      { timestamp: new Date('2026-09-07T10:30:00.000Z'), price: 0.0015 }, // +50%
    ];

    const outcome = OutcomeEvaluator.evaluate({
      tokenId: 'tok-sol-mfe-test',
      anchorTimestamp: anchorTime,
      anchorPrice,
      pricePoints,
    });

    expect(outcome.mfe).toBe(150); // Peak gain +150%
    expect(outcome.mae).toBe(-20);  // Max trough -20%
    expect(outcome.timeToPeakSec).toBe(480); // 8 mins = 480 sec
    expect(outcome.timeToDrawdownSec).toBe(60); // 1 min = 60 sec
  });

  it('detects liquidity rug / drain occurring within outcome horizon', () => {
    const pricePoints: PricePoint[] = [
      { timestamp: new Date('2026-09-07T10:01:00.000Z'), price: 0.0011, liquidity: 40000 },
      { timestamp: new Date('2026-09-07T10:05:00.000Z'), price: 0.0001, liquidity: 500 }, // Rugged: 98.7% liquidity drop
    ];

    const outcome = OutcomeEvaluator.evaluate({
      tokenId: 'tok-rug-test',
      anchorTimestamp: anchorTime,
      anchorPrice,
      pricePoints,
      anchorLiquidity: 40000,
    });

    expect(outcome.liquidityChangePct).toBeLessThan(-90);
  });
});
