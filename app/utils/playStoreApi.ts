/**
 * Google Play Console API integration
 * Fetches total installs/downloads from Google Play Console
 */

interface GooglePlayCredentials {
  client_email: string;
  private_key: string;
}

/**
 * Authenticate with Google Play Console API using service account
 */
async function getGooglePlayAuthToken(
  credentials: GooglePlayCredentials,
): Promise<string> {
  const jwt = await import("jsonwebtoken");
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    credentials.private_key,
    {
      algorithm: "RS256",
      header: {
        alg: "RS256",
        typ: "JWT",
      },
    },
  );

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Google OAuth error: ${data.error || "Unknown error"}`);
  }

  return data.access_token;
}

/**
 * Fetch total installs from Google Play Console
 * Requires: Package name (e.g., 'com.yourcompany.yourapp')
 */
export async function fetchPlayStoreDownloads(
  packageName: string,
  credentials?: GooglePlayCredentials,
): Promise<number> {
  try {
    // Get credentials from environment or parameter
    let creds: GooglePlayCredentials = credentials!;
    if (!creds) {
      const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
      if (!serviceAccountJson) {
        throw new Error("Google Play credentials not found in environment");
      }
      creds = JSON.parse(serviceAccountJson);
    }

    if (!creds || !creds.client_email || !creds.private_key) {
      throw new Error("Invalid Google Play credentials");
    }

    // Get access token
    const accessToken = await getGooglePlayAuthToken(creds);

    // Fetch statistics from Google Play Console API
    // Using the Android Publisher API v3 - get app details which includes install stats
    // Note: The exact endpoint may vary - trying alternative approaches
    let response;
    let totalInstalls = 0;

    // Try method 1: Get app details (includes basic stats)
    try {
      response = await fetch(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Check various possible structures for install count
        totalInstalls =
          data.installs || data.totalInstalls || data.installStats?.total || 0;
        if (totalInstalls > 0) {
          return typeof totalInstalls === "number"
            ? totalInstalls
            : parseInt(totalInstalls, 10) || 0;
        }
      }
    } catch (err) {
      console.warn("Method 1 failed, trying alternative:", err);
    }

    // Try method 2: Use Statistics API endpoint (if available)
    try {
      response = await fetch(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/statistics`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        totalInstalls =
          data.installs?.total || data.totalInstalls || data.installCount || 0;
        if (totalInstalls > 0) {
          return typeof totalInstalls === "number"
            ? totalInstalls
            : parseInt(totalInstalls, 10) || 0;
        }
      }
    } catch (err) {
      console.warn("Method 2 failed, trying alternative:", err);
    }

    // Try method 3: Use Google Play Developer Reporting API (newer API)
    // This might require different scopes, but worth trying
    try {
      response = await fetch(
        `https://playdeveloperreporting.googleapis.com/v1/apps/${packageName}/stats/installs`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        totalInstalls = data.totalInstalls || data.installs || 0;
        if (totalInstalls > 0) {
          return typeof totalInstalls === "number"
            ? totalInstalls
            : parseInt(totalInstalls, 10) || 0;
        }
      }
    } catch (err) {
      console.warn("Method 3 failed:", err);
    }

    // If all methods fail, return error
    if (response && !response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Google Play API error: ${response.status} - ${JSON.stringify(
          error,
        )}. All API methods failed. Please check that the service account has proper permissions in Google Play Console.`,
      );
    }

    // If we get here, none of the methods worked
    throw new Error(
      "Unable to fetch install statistics. Please verify that the Google Play Console API is enabled and the service account has View app information and financial data permissions in Google Play Console.",
    );
  } catch (error) {
    console.error("Error fetching PlayStore downloads:", error);
    throw error;
  }
}
