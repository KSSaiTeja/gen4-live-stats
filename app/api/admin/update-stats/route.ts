import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface UpdateStatsRequest {
  // playstore: number;
  // appstore: number;
  revenue: number;
}

/**
 * Update statistics in data/downloads.json
 */
export async function POST(request: Request) {
  try {
    const body: UpdateStatsRequest = await request.json();
    
    // Validate the data
    const { revenue } = body;
    // const { playstore, appstore, revenue } = body;
    
    if (typeof revenue !== "number") {
      return NextResponse.json(
        { error: "Invalid data format. Revenue must be a number." },
        { status: 400 }
      );
    }

    if (revenue < 0) {
      return NextResponse.json(
        { error: "Revenue must be a non-negative number." },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "data", "downloads.json");

    // Read existing data
    let existingData: any = {};
    if (fs.existsSync(filePath)) {
      const existingContent = fs.readFileSync(filePath, "utf8");
      existingData = JSON.parse(existingContent);
    }

    // Update with new values (keep existing playstore/appstore if present)
    const updatedData = {
      ...existingData,
      // playstore,
      // appstore,
      revenue,
      lastUpdated: new Date().toISOString(),
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

    return NextResponse.json(
      {
        success: true,
        message: "Statistics updated successfully",
        data: updatedData,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error updating statistics:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}