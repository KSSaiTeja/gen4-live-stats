import { NextResponse } from "next/server";

/**
 * Reads download counts from data/downloads.json
 * This file is updated daily by the cron job (/api/cron/fetch-downloads)
 */
export async function GET() {
  try {
    // Use JSONBin to read data (external storage)
    const jsonBinUrl = process.env.JSONBIN_URL || 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID';
    const jsonBinKey = process.env.JSONBIN_API_KEY;

    if (!jsonBinKey) {
      // Fallback to default values if JSONBin not configured
      return NextResponse.json({
        playstore: 10000,
        appstore: 10000,
        revenue: 100003,
        lastUpdated: new Date().toISOString(),
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }

    // Fetch from JSONBin
    const response = await fetch(jsonBinUrl, {
      headers: {
        'X-Master-Key': jsonBinKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from external storage');
    }

    const result = await response.json();
    const data = result.record || {};

    return NextResponse.json({
      playstore: data.playstore || 10000,
      appstore: data.appstore || 10000,
      revenue: data.revenue || 100003,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error reading stats:", error);

    // Fallback to current values from your data
    return NextResponse.json({
      playstore: 10000,
      appstore: 10000,
      revenue: 100003,
      lastUpdated: new Date().toISOString(),
    });
  }
}
