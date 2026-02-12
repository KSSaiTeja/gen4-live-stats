import { NextResponse } from "next/server";
import { writeStatsToFile } from "@/app/lib/statsFile";

interface UpdateStatsRequest {
  revenue: number;
  usersThisMonth?: number;
}

/**
 * Update statistics using JSONBin (external storage)
 */
export async function POST(request: Request) {
  try {
    const body: UpdateStatsRequest = await request.json();
    
    // Validate the data
    const { revenue, usersThisMonth } = body;
    
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

    if (usersThisMonth !== undefined) {
      if (typeof usersThisMonth !== "number") {
        return NextResponse.json(
          { error: "Invalid data format. Users this month must be a number." },
          { status: 400 }
        );
      }
      if (usersThisMonth < 0) {
        return NextResponse.json(
          { error: "Users this month must be a non-negative number." },
          { status: 400 }
        );
      }
    }

    // Use JSONBin to store data (free external storage)
    const jsonBinUrl = process.env.JSONBIN_URL || 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID';
    const jsonBinKey = process.env.JSONBIN_API_KEY;

    if (!jsonBinKey) {
      // Persist to data/downloads.json so homepage shows updated stats
      try {
        writeStatsToFile({
          revenue,
          usersThisMonth: usersThisMonth ?? 0,
        });
      } catch (err) {
        console.error("Failed to write stats file:", err);
        return NextResponse.json(
          { success: false, error: "Failed to save statistics locally." },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Statistics updated (saved to local file)",
        data: { revenue, usersThisMonth: usersThisMonth ?? 0, lastUpdated: new Date().toISOString() },
      });
    }

    // Get existing data
    let existingData: any = {};
    try {
      const getResponse = await fetch(jsonBinUrl, {
        headers: {
          'X-Master-Key': jsonBinKey,
        },
      });
      if (getResponse.ok) {
        const result = await getResponse.json();
        existingData = result.record || {};
      }
    } catch (error) {
      console.log('No existing data found, creating new...');
    }

    // Update with new values
    const updatedData = {
      ...existingData,
      revenue,
      ...(usersThisMonth !== undefined && { usersThisMonth }),
      lastUpdated: new Date().toISOString(),
    };

    // Save to JSONBin
    const updateResponse = await fetch(jsonBinUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': jsonBinKey,
      },
      body: JSON.stringify(updatedData),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update external storage');
    }

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