import fs from "fs";
import path from "path";

const STATS_PATH = path.join(process.cwd(), "data", "downloads.json");

export interface StatsData {
  playstore: number;
  appstore: number;
  revenue: number;
  usersThisMonth: number;
  lastUpdated: string;
}

const defaults: StatsData = {
  playstore: 10000,
  appstore: 10000,
  revenue: 100003,
  usersThisMonth: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Read stats from data/downloads.json (used when JSONBin is not configured).
 */
export function readStatsFromFile(): StatsData {
  try {
    if (!fs.existsSync(STATS_PATH)) {
      return { ...defaults };
    }
    const raw = fs.readFileSync(STATS_PATH, "utf8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    return {
      playstore: typeof data.playstore === "number" ? data.playstore : defaults.playstore,
      appstore: typeof data.appstore === "number" ? data.appstore : defaults.appstore,
      revenue: typeof data.revenue === "number" ? data.revenue : defaults.revenue,
      usersThisMonth:
        typeof data.usersThisMonth === "number" ? data.usersThisMonth : defaults.usersThisMonth,
      lastUpdated:
        typeof data.lastUpdated === "string" ? data.lastUpdated : defaults.lastUpdated,
    };
  } catch (e) {
    console.error("Error reading stats file:", e);
    return { ...defaults };
  }
}

/**
 * Write revenue and usersThisMonth to data/downloads.json, preserving other fields.
 */
export function writeStatsToFile(updates: {
  revenue: number;
  usersThisMonth: number;
}): void {
  try {
    const existing = readStatsFromFile();
    const merged: StatsData = {
      ...existing,
      revenue: updates.revenue,
      usersThisMonth: updates.usersThisMonth,
      lastUpdated: new Date().toISOString(),
    };
    const dir = path.dirname(STATS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATS_PATH, JSON.stringify(merged, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing stats file:", e);
    throw e;
  }
}
