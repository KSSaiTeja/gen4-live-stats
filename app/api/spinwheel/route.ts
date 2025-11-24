import { NextResponse } from "next/server";

/**
 * Proxy endpoint for spin wheel count (leads count)
 * Fetches from external API server-side to avoid CORS issues
 * API: https://gen4-launch.vercel.app/api/leads/count
 * Response: {"count": 62, "fetchedAt": "..."}
 */
export async function GET() {
  try {
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(
      `https://gen4-launch.vercel.app/api/leads/count?_=${timestamp}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Spin Wheel API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    // API can return: {"count": 62} (object), 62 (number), or "62" (string)
    let count = 0;

    if (typeof data === "number") {
      count = data;
    } else if (typeof data === "string") {
      // Handle string numbers like "62"
      const parsed = parseInt(data, 10);
      count = isNaN(parsed) ? 0 : parsed;
    } else if (typeof data === "object" && data !== null) {
      // API returns: {"count": 62, "fetchedAt": "..."}
      const countValue = data.count || data.leads || data.value || data.total;
      if (countValue !== undefined && countValue !== null) {
        // Ensure it's a number
        count =
          typeof countValue === "number"
            ? countValue
            : parseInt(String(countValue), 10);
        if (isNaN(count)) {
          count = 0;
        }
      }
    }

    return NextResponse.json(
      { count },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching spin wheel count:", error);
    // Return 0 on error (graceful fallback)
    return NextResponse.json(
      { count: 0 },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}

