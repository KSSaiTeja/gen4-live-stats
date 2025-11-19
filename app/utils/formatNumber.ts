/**
 * Formats numbers - shows actual numbers for 1-4 digits, uses K/M format for 5+ digits
 * Rules:
 * - 0-9999: Show actual number (e.g., "9,999")
 * - 10000+: Use K format (e.g., "10K", "100K", "1.5M")
 */
export function formatNumber(num: number): string {
  // Show actual numbers for 1-4 digits (0-9999)
  if (num < 10000) {
    return num.toLocaleString('en-US'); // Adds commas: 1234 -> "1,234"
  }

  // For 5 digits and above, use K format
  if (num < 1000000) {
    const thousands = num / 1000;
    // Round to 1 decimal place if needed
    if (thousands % 1 === 0) {
      return `${thousands}K`;
    }
    return `${thousands.toFixed(1)}K`;
  }

  // For millions and above
  const millions = num / 1000000;
  if (millions % 1 === 0) {
    return `${millions}M`;
  }
  return `${millions.toFixed(1)}M`;
}
