/**
 * Calculate simple return: (P_t - P_previous) / P_previous
 * Returns 0 if previous price is <= 0 or invalid.
 */
export function calculateReturn(currentPrice: number, previousPrice: number): number {
  if (previousPrice <= 0 || !Number.isFinite(previousPrice) || !Number.isFinite(currentPrice)) {
    return 0;
  }
  return (currentPrice - previousPrice) / previousPrice;
}

/**
 * Calculate Logarithmic return: ln(P_t / P_previous)
 */
export function calculateLogReturn(currentPrice: number, previousPrice: number): number {
  if (previousPrice <= 0 || currentPrice <= 0 || !Number.isFinite(previousPrice) || !Number.isFinite(currentPrice)) {
    return 0;
  }
  return Math.log(currentPrice / previousPrice);
}
