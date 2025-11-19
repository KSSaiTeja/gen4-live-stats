import { NextResponse } from 'next/server';
import { fetchPlayStoreDownloadsScraper } from '@/app/utils/playStoreScraper';
import fs from 'fs';
import path from 'path';

/**
 * Cron endpoint to fetch PlayStore downloads via scraper
 * Runs daily at midnight (00:00 UTC) via Vercel Cron Jobs
 * Free plan supports daily cron jobs only
 */
export async function GET(request: Request) {
  try {
    // Verify this is called from cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.savart';
    
    console.log(`Fetching downloads for: ${packageName}`);
    
    // Fetch using scraper
    const downloadsCount = await fetchPlayStoreDownloadsScraper(packageName);
    
    console.log(`Fetched downloads: ${downloadsCount}`);

    // Read existing JSON file
    const downloadsPath = path.join(process.cwd(), 'data', 'downloads.json');
    let existingData: any = {};
    
    if (fs.existsSync(downloadsPath)) {
      const existingContent = fs.readFileSync(downloadsPath, 'utf8');
      existingData = JSON.parse(existingContent);
    }

    // Update playstore value
    existingData.playstore = downloadsCount;
    existingData.lastUpdated = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(downloadsPath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Downloads fetched successfully',
      downloads: {
        playstore: downloadsCount,
        lastUpdated: existingData.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Error in cron fetch-downloads:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
