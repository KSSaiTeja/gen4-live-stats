import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Reads download counts from data/downloads.json
 * This file is updated daily by the cron job (/api/cron/fetch-downloads)
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "downloads.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        playstore: 0,
        appstore: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    return NextResponse.json({
      playstore: data.playstore || 0,
      appstore: data.appstore || 0,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error reading downloads file:", error);

    return NextResponse.json({
      playstore: 0,
      appstore: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
}
