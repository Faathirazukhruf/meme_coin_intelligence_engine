/**
 * Growth, Velocity and Acceleration Mathematics
 */

/**
 * Robust Growth: (X_t - X_previous) / (X_previous + epsilon)
 */
export function calculateGrowth(currentValue: number, previousValue: number, epsilon = 1e-8): number {
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return 0;
  }
  return (currentValue - previousValue) / (Math.abs(previousValue) + epsilon);
}

/**
 * Velocity: (X_t - X_previous) / timeWindow
 */
export function calculateVelocity(currentValue: number, previousValue: number, timeWindow: number): number {
  if (timeWindow <= 0 || !Number.isFinite(timeWindow) || !Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return 0;
  }
  return (currentValue - previousValue) / timeWindow;
}

/**
 * Acceleration: Velocity_t - Velocity_previous
 */
export function calculateAcceleration(currentVelocity: number, previousVelocity: number): number {
  if (!Number.isFinite(currentVelocity) || !Number.isFinite(previousVelocity)) {
    return 0;
  }
  return currentVelocity - previousVelocity;
}
