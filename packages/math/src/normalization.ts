/**
 * Robust Normalization and Scaling (PRD Section 16)
 */

/**
 * Min-Max Clamp with normalization to [minTarget, maxTarget]
 */
export function normalizeMinMax(
  value: number,
  minVal: number,
  maxVal: number,
  minTarget = 0,
  maxTarget = 100
): number {
  if (maxVal <= minVal || !Number.isFinite(value) || !Number.isFinite(minVal) || !Number.isFinite(maxVal)) {
    return minTarget;
  }
  const clamped = Math.max(minVal, Math.min(maxVal, value));
  const normalized = (clamped - minVal) / (maxVal - minVal);
  return minTarget + normalized * (maxTarget - minTarget);
}

/**
 * Robust Z-Score: (x - median) / (MAD * 1.4826)
 */
export function calculateRobustZScore(value: number, median: number, mad: number, epsilon = 1e-6): number {
  if (!Number.isFinite(value) || !Number.isFinite(median) || !Number.isFinite(mad)) {
    return 0;
  }
  const effectiveScale = mad * 1.4826 + epsilon;
  return (value - median) / effectiveScale;
}

/**
 * Percentile Rank of a value in an array of numbers.
 * Range: [0, 100]
 */
export function calculatePercentileRank(value: number, dataset: number[]): number {
  if (!Array.isArray(dataset) || dataset.length === 0 || !Number.isFinite(value)) {
    return 50;
  }
  const validValues = dataset.filter(Number.isFinite);
  if (validValues.length === 0) return 50;

  const countBelow = validValues.filter((x) => x < value).length;
  const countEqual = validValues.filter((x) => x === value).length;

  return ((countBelow + 0.5 * countEqual) / validValues.length) * 100;
}
