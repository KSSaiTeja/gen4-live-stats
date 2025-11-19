/**
 * Calculates percentage change between two values
 * @param current - Current value
 * @param previous - Previous value (yesterday)
 * @returns Object with change percentage and direction
 */
export function calculateChange(
  current: number,
  previous: number
): {
  percentage: number;
  isIncrease: boolean;
  isEqual: boolean;
  absoluteChange: number;
} {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      isIncrease: current > 0,
      isEqual: current === 0,
      absoluteChange: current,
    };
  }

  const absoluteChange = current - previous;
  const percentage = Math.abs((absoluteChange / previous) * 100);
  const isIncrease = absoluteChange > 0;
  const isEqual = absoluteChange === 0;

  return {
    percentage: Number(percentage.toFixed(1)),
    isIncrease,
    isEqual,
    absoluteChange: Math.abs(absoluteChange),
  };
}

