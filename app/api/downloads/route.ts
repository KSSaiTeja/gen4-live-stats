import { NextResponse } from "next/server";
import { readStatsFromFile } from "@/app/lib/statsFile";

// Always run fresh so admin saves are visible immediately on the homepage
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Reads download counts from data/downloads.json or JSONBin.
 * When JSONBin is not configured, reads from data/downloads.json (same file admin writes to).
 */
export async function GET() {
  try {
    const jsonBinUrl = process.env.JSONBIN_URL || "https://api.jsonbin.io/v3/b/YOUR_BIN_ID";
    const jsonBinKey = process.env.JSONBIN_API_KEY;

    if (!jsonBinKey) {
      // Use local file so admin saves persist and homepage shows updated stats
      const data = readStatsFromFile();
      return NextResponse.json(
        {
          playstore: data.playstore,
          appstore: data.appstore,
          revenue: data.revenue,
          usersThisMonth: data.usersThisMonth,
          lastUpdated: data.lastUpdated,
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // Fetch from JSONBin (no-store so we always get latest after admin save)
    const response = await fetch(jsonBinUrl, {
      cache: "no-store",
      headers: {
        "X-Master-Key": jsonBinKey,
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
      usersThisMonth: data.usersThisMonth ?? 0,
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
      usersThisMonth: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
}
