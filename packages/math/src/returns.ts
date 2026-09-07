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

/**
 * Calculate Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE)
 * Returns values in percentage (e.g., +50% MFE, -15% MAE).
 */
export function calculateMfeMae(
  anchorPrice: number,
  prices: number[]
): { mfe: number; mae: number } {
  if (anchorPrice <= 0 || !prices || prices.length === 0) {
    return { mfe: 0, mae: 0 };
  }

  let maxPrice = anchorPrice;
  let minPrice = anchorPrice;

  for (const p of prices) {
    if (p > maxPrice) maxPrice = p;
    if (p < minPrice) minPrice = p;
  }

  const mfe = ((maxPrice - anchorPrice) / anchorPrice) * 100;
  const mae = ((minPrice - anchorPrice) / anchorPrice) * 100;

  return {
    mfe: Math.max(0, mfe),
    mae: Math.min(0, mae),
  };
}
