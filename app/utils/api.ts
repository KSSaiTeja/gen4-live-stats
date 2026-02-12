/**
 * API utility functions for fetching live stats
 */


/**
 * Fetch waitlist count
 * Returns the number of filled spots (1000 - remaining from API)
 * API returns remaining spots, so we calculate: filled = 1000 - remaining
 */
export async function fetchWaitlistFilled(): Promise<number> {
  try {
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(
      `https://savart.com/excel/p4_waitlist_count?_=${timestamp}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

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
 * This file is updated daily by the cron job
 */
export async function fetchPlayStoreDownloads(): Promise<number> {
  try {
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(`/api/downloads?_=${timestamp}`, {
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
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(`/api/downloads?_=${timestamp}`, {
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
 * Fetch current subscriptions count from external API
 * API returns: "2631" (JSON string)
 */
export async function fetchSubscriptions(): Promise<number> {
  try {
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(
      `https://savart.com/workflow/secret_api?_=${timestamp}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

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
 * Fetch revenue from local data (JSONBin via /api/downloads)
 */
export async function fetchRevenue(): Promise<number> {
  try {
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(`/api/downloads?_=${timestamp}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Revenue API error: ${response.status}`);
    }

    const data = await response.json();
    return data.revenue || 0;
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return 0; // Return 0 on error (graceful fallback)
  }
}

/**
 * Fetch number of users this month from local data (JSONBin via /api/downloads).
 * Same source as revenue — editable on admin page.
 */
export async function fetchUsersThisMonth(): Promise<number> {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/downloads?_=${timestamp}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Users this month API error: ${response.status}`);
    }

    const data = await response.json();
    return data.usersThisMonth ?? 0;
  } catch (error) {
    console.error("Error fetching users this month:", error);
    return 0;
  }
}

/**
 * Fetch spin wheel count (leads count)
 * Uses local API proxy to avoid CORS issues
 * API: /api/spinwheel
 * Response: {"count": 62}
 */
export async function fetchSpinWheelCount(): Promise<number> {
  try {
    // Use timestamp to bust cache and ensure fresh data
    const timestamp = Date.now();
    const response = await fetch(`/api/spinwheel?_=${timestamp}`, {
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
    // API returns: {"count": 62}
    if (typeof data === "number") {
      return data;
    }

    if (typeof data === "string") {
      // Handle string numbers like "62"
      const parsed = parseInt(data, 10);
      if (isNaN(parsed)) {
        console.warn("Spin Wheel: Invalid string response:", data);
        return 0;
      }
      return parsed;
    }

    if (typeof data === "object" && data !== null) {
      // API returns: {"count": 62}
      const count = data.count || data.leads || data.value || data.total;
      if (count !== undefined && count !== null) {
        // Ensure it's a number
        const numCount =
          typeof count === "number" ? count : parseInt(String(count), 10);
        return isNaN(numCount) ? 0 : numCount;
      }
      console.warn("Spin Wheel: No count found in response:", data);
      return 0;
    }

    console.warn("Spin Wheel: Unexpected response format:", typeof data, data);
    return 0;
  } catch (error) {
    console.error("Error fetching spin wheel count:", error);
    return 0; // Return 0 on error (graceful fallback)
  }
}
