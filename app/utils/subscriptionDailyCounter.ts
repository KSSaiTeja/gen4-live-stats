/**
 * Returns subscription delta since a fixed baseline.
 * Baseline can be provided via env NEXT_PUBLIC_SUBS_BASELINE or hardcoded fallback.
 * This keeps accumulating from the baseline - it does NOT reset daily.
 *
 * Example: If baseline is 2513 and current total is 2516, returns 3.
 * Tomorrow if total is 2520, returns 7 (keeps accumulating).
 */
export const getTodaySubscriptionCount = (currentTotal: number): number => {
  // In Next.js, NEXT_PUBLIC_* env vars are embedded at build time
  const envBaselineStr = process.env.NEXT_PUBLIC_SUBS_BASELINE;
  const envBaseline = envBaselineStr ? parseInt(envBaselineStr, 10) : NaN;

  // Use env if valid, otherwise fallback to 2513
  const baseline = !isNaN(envBaseline) && envBaseline > 0 ? envBaseline : 2513;

  const delta = currentTotal - baseline;

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Subscriptions Debug]", {
      currentTotal,
      baseline,
      delta: delta < 0 ? 0 : delta,
      envBaselineStr,
    });
  }

  return delta < 0 ? 0 : delta;
};
