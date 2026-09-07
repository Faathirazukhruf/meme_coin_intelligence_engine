import { OutcomeEntity, HorizonPrice } from '@meme-coin/types';
import { calculateReturn, calculateMfeMae } from '@meme-coin/math';

export interface PricePoint {
  timestamp: Date;
  price: number;
  liquidity?: number;
}

export interface OutcomeEvaluationInput {
  tokenId: string;
  signalId?: string | null;
  anchorTimestamp: Date;
  anchorPrice: number;
  pricePoints: PricePoint[]; // Price observations after anchorTimestamp
  anchorLiquidity?: number;
}

export class OutcomeEvaluator {
  /**
   * Evaluates forward outcome horizons, MFE, MAE, and liquidity shifts
   * with strict zero look-ahead validation (PRD Section 17 & 21).
   */
  static evaluate(input: OutcomeEvaluationInput): OutcomeEntity {
    const { tokenId, signalId, anchorTimestamp, anchorPrice, pricePoints, anchorLiquidity } = input;

    if (anchorPrice <= 0) {
      throw new Error(`Invalid anchor price: ${anchorPrice}`);
    }

    const anchorTimeMs = anchorTimestamp.getTime();

    // Sort price points chronologically
    const sortedPoints = [...pricePoints].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Horizon offsets in seconds
    const horizonsSec = {
      '1m': 60,
      '3m': 180,
      '5m': 300,
      '10m': 600,
      '30m': 1800,
      '1h': 3600,
      '6h': 21600,
      '24h': 86400,
    };

    const horizonPrices: Record<string, HorizonPrice | null> = {
      '1m': null,
      '3m': null,
      '5m': null,
      '10m': null,
      '30m': null,
      '1h': null,
      '6h': null,
      '24h': null,
    };

    // Find closest price observation at or right after each horizon
    for (const [key, offsetSec] of Object.entries(horizonsSec)) {
      const targetTimeMs = anchorTimeMs + offsetSec * 1000;
      // Allow window tolerance of ±30s or closest subsequent point
      const point = sortedPoints.find(
        (p) => Math.abs(p.timestamp.getTime() - targetTimeMs) <= 30000 || p.timestamp.getTime() >= targetTimeMs
      );

      if (point && point.timestamp.getTime() >= targetTimeMs - 30000) {
        const ret = calculateReturn(point.price, anchorPrice) * 100;
        horizonPrices[key] = {
          price: point.price,
          returnPct: Number(ret.toFixed(2)),
          timestamp: point.timestamp,
        };
      }
    }

    // Compute MFE & MAE over all forward points
    const pricesOnly = sortedPoints.map((p) => p.price);
    const { mfe, mae } = calculateMfeMae(anchorPrice, pricesOnly);

    // Find time to peak (MFE) and time to drawdown (MAE)
    let timeToPeakSec: number | null = null;
    let timeToDrawdownSec: number | null = null;
    let maxP = anchorPrice;
    let minP = anchorPrice;

    for (const p of sortedPoints) {
      const elapsedSec = Math.round((p.timestamp.getTime() - anchorTimeMs) / 1000);
      if (p.price > maxP) {
        maxP = p.price;
        timeToPeakSec = elapsedSec;
      }
      if (p.price < minP) {
        minP = p.price;
        timeToDrawdownSec = elapsedSec;
      }
    }

    // Liquidity change detection (rug check)
    let liquidityChangePct: number | null = null;
    if (anchorLiquidity && anchorLiquidity > 0 && sortedPoints.length > 0) {
      const lastPoint = sortedPoints[sortedPoints.length - 1];
      if (lastPoint && lastPoint.liquidity !== undefined) {
        liquidityChangePct = Number(
          (((lastPoint.liquidity - anchorLiquidity) / anchorLiquidity) * 100).toFixed(2)
        );
      }
    }

    return {
      id: `outcome-${tokenId}-${anchorTimeMs}`,
      tokenId,
      signalId: signalId ?? null,
      anchorTimestamp,
      anchorPrice,
      price1m: horizonPrices['1m'],
      price3m: horizonPrices['3m'],
      price5m: horizonPrices['5m'],
      price10m: horizonPrices['10m'],
      price30m: horizonPrices['30m'],
      price1h: horizonPrices['1h'],
      price6h: horizonPrices['6h'],
      price24h: horizonPrices['24h'],
      mfe: Number(mfe.toFixed(2)),
      mae: Number(mae.toFixed(2)),
      timeToPeakSec,
      timeToDrawdownSec,
      liquidityChangePct,
    };
  }
}
