/**
 * Token Concentration and Creator Risk Mathematics (PRD Section 11 & 16)
 */

/**
 * Top-N Concentration: sum(top N balances) / circulatingSupply
 * Output range: [0, 1]
 */
export function calculateTopNConcentration(topBalances: number[], circulatingSupply: number): number {
  if (circulatingSupply <= 0 || !Number.isFinite(circulatingSupply) || !Array.isArray(topBalances) || topBalances.length === 0) {
    return 0;
  }
  const sumTop = topBalances.reduce((acc, bal) => acc + (Number.isFinite(bal) ? Math.max(0, bal) : 0), 0);
  return Math.min(1, Math.max(0, sumTop / circulatingSupply));
}

/**
 * Creator Ratio: creatorControlledTokens / circulatingSupply
 * Output range: [0, 1]
 */
export function calculateCreatorRatio(creatorTokens: number, circulatingSupply: number): number {
  if (circulatingSupply <= 0 || !Number.isFinite(circulatingSupply) || !Number.isFinite(creatorTokens)) {
    return 0;
  }
  return Math.min(1, Math.max(0, creatorTokens / circulatingSupply));
}

/**
 * Dev Sell Pressure: devSellVolume / initialAllocation
 * Output range: [0, 1+]
 */
export function calculateDevSellPressure(devSellVolume: number, initialAllocation: number): number {
  if (initialAllocation <= 0 || !Number.isFinite(initialAllocation) || !Number.isFinite(devSellVolume)) {
    return 0;
  }
  return Math.max(0, devSellVolume / initialAllocation);
}
