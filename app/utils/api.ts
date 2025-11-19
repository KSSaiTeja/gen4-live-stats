/**
 * API utility functions for fetching live stats
 */

/**
 * Fetch current subscriptions count
 * API returns: "2631" (JSON string)
 */
export async function fetchSubscriptions(): Promise<number> {
  try {
    const response = await fetch("https://savart.com/workflow/secret_api", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Subscriptions API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    // API can return: "2631" (JSON string), 2631 (number), or {"count": 2631} (object)
    if (typeof data === "number") {
      return data;
    }
    
    if (typeof data === "string") {
      // Handle string numbers like "2631"
      const parsed = parseInt(data, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    if (typeof data === "object" && data !== null) {
      // Try common property names
      return data.count || data.subscriptions || data.value || data.total || 0;
    }
    
    return 0;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return 0; // Return 0 on error (graceful fallback)
  }
}

/**
 * Fetch waitlist count
 * Returns the number of filled spots (1000 - remaining from API)
 * API returns remaining spots, so we calculate: filled = 1000 - remaining
 */
export async function fetchWaitlistFilled(): Promise<number> {
  try {
    const response = await fetch("https://savart.com/excel/p4_waitlist_count", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Waitlist API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    // API returns: {"data":{"remaining_count":644,"user_position":null},"error":null,"statusCode":0}
    let remainingSpots = 0;

    if (typeof data === "number") {
      remainingSpots = data;
    } else if (typeof data === "string") {
      // Handle string numbers
      const parsed = parseInt(data, 10);
      remainingSpots = isNaN(parsed) ? 0 : parsed;
    } else if (typeof data === "object" && data !== null) {
      // Check for nested data structure: data.data.remaining_count
      if (data.data && typeof data.data === "object") {
        remainingSpots =
          data.data.remaining_count ||
          data.data.remaining ||
          data.data.count ||
          data.data.value ||
          0;
      } else {
        // Try top-level properties
        remainingSpots =
          data.remaining_count !== undefined
            ? data.remaining_count
            : data.remaining !== undefined
            ? data.remaining
            : data.count !== undefined
            ? data.count
            : data.waitlist !== undefined
            ? data.waitlist
            : data.value !== undefined
            ? data.value
            : data.total !== undefined
            ? data.total
            : 0;
      }
    }

    // Calculate filled spots: 1000 - remaining spots
    // API returns remaining spots in data.data.remaining_count
    // So filled = 1000 - remaining
    const filled = 1000 - remainingSpots;

    // Ensure it's between 0 and 1000
    return Math.max(0, Math.min(1000, filled));
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return 0; // Return 0 on error (graceful fallback)
  }
}

/**
 * Fetches PlayStore downloads from data/downloads.json
 * This file is updated every 4 hours by the cron job
 */
export async function fetchPlayStoreDownloads(): Promise<number> {
  try {
    const response = await fetch("/api/downloads", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Downloads API error: ${response.status}`);
    }

    const data = await response.json();
    return data.playstore || 0;
  } catch (error) {
    console.error("Error fetching PlayStore downloads:", error);
    return 0;
  }
}

export async function fetchAppStoreDownloads(): Promise<number> {
  try {
    // Call the Next.js API route (no external backend needed!)
    const response = await fetch("/api/downloads", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`AppStore API error: ${response.status}`);
    }

    const data = await response.json();
    return data.appstore || 0;
  } catch (error) {
    console.error("Error fetching AppStore downloads:", error);
    return 0; // Return 0 on error (graceful fallback)
  }
}

/**
 * Fetch spin wheel count (leads count)
 * API: https://gen4-launch.vercel.app/api/leads/count
 * Response: {"count": 62}
 */
export async function fetchSpinWheelCount(): Promise<number> {
  try {
    const response = await fetch("https://gen4-launch.vercel.app/api/leads/count", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Spin Wheel API error: ${response.status}`);
    }

    const data = await response.json();
    // Handle different response formats
    if (typeof data === "number") {
      return data;
    }
    if (typeof data === "object" && data !== null) {
      // API returns: {"count": 62}
      return data.count || data.leads || data.value || data.total || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching spin wheel count:", error);
    return 0; // Return 0 on error (graceful fallback)
  }
}
