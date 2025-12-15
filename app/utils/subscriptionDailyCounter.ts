/**
 * Returns subscription delta since a fixed baseline.
 * Baseline can be provided via env NEXT_PUBLIC_SUBS_BASELINE or hardcoded fallback.
 */
export const getTodaySubscriptionCount = (currentTotal: number): number => {
  const envBaseline = process.env.NEXT_PUBLIC_SUBS_BASELINE
    ? parseInt(process.env.NEXT_PUBLIC_SUBS_BASELINE, 10)
    : NaN;
  const baseline = !isNaN(envBaseline) ? envBaseline : 2513; // fallback as requested
  const delta = currentTotal - baseline;
  return delta < 0 ? 0 : delta;
};
