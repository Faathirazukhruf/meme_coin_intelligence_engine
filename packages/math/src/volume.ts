/**
 * Volume and Order Flow Mathematics (PRD Section 11 & 16)
 */

/**
 * Buy Pressure: BuyVolume / (BuyVolume + SellVolume)
 * Range: [0, 1]. Returns 0.5 when total volume is 0.
 */
export function calculateBuyPressure(buyVolume: number, sellVolume: number): number {
  const totalVolume = buyVolume + sellVolume;
  if (totalVolume <= 0 || !Number.isFinite(totalVolume)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, buyVolume / totalVolume));
}

/**
 * Buy/Sell Imbalance: (BuyVolume - SellVolume) / (BuyVolume + SellVolume)
 * Range: [-1, 1]. Returns 0 when total volume is 0.
 */
export function calculateBuySellImbalance(buyVolume: number, sellVolume: number): number {
  const totalVolume = buyVolume + sellVolume;
  if (totalVolume <= 0 || !Number.isFinite(totalVolume)) {
    return 0;
  }
  return Math.max(-1, Math.min(1, (buyVolume - sellVolume) / totalVolume));
}

/**
 * Volume Velocity: (Volume_t - Volume_previous) / timeWindowMinutes
 */
export function calculateVolumeVelocity(currentVolume: number, previousVolume: number, timeWindowMinutes: number): number {
  if (timeWindowMinutes <= 0 || !Number.isFinite(timeWindowMinutes)) {
    return 0;
  }
  return (currentVolume - previousVolume) / timeWindowMinutes;
}

/**
 * Volume Acceleration: Velocity_t - Velocity_previous
 */
export function calculateVolumeAcceleration(currentVelocity: number, previousVelocity: number): number {
  return currentVelocity - previousVelocity;
}

/**
 * Volume to Liquidity Ratio: Volume / Liquidity
 */
export function calculateVolumeLiquidityRatio(volume: number, liquidity: number): number {
  if (liquidity <= 0 || !Number.isFinite(liquidity) || !Number.isFinite(volume)) {
    return 0;
  }
  return volume / liquidity;
}
