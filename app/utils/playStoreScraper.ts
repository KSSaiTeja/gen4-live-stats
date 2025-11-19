/**
 * Google Play Store Scraper
 * Fetches download count by scraping the Play Store page
 * Alternative to official API when credentials aren't available
 */

import * as cheerio from "cheerio";

/**
 * Parse downloads string to number
 * Handles formats like: "10,000,000+", "1L+", "50,000+", etc.
 */
function parseDownloadsString(downloadsString: string): number {
  if (
    !downloadsString ||
    downloadsString === "null" ||
    downloadsString.trim() === ""
  ) {
    return 0;
  }

  // Remove + sign and trim
  let cleaned = downloadsString.replace(/\+/g, "").trim();

  // Handle Indian numbering system (L = Lakhs = 100,000)
  if (/L/i.test(cleaned)) {
    const number = parseFloat(cleaned.replace(/[L,l,]/g, ""));
    return Math.floor(number * 100000);
  }

  // Handle M (Millions)
  if (/M/i.test(cleaned)) {
    const number = parseFloat(cleaned.replace(/[M,m,]/g, ""));
    return Math.floor(number * 1000000);
  }

  // Handle K (Thousands)
  if (/K/i.test(cleaned)) {
    const number = parseFloat(cleaned.replace(/[K,k,]/g, ""));
    return Math.floor(number * 1000);
  }

  // Handle regular numbers with commas
  const number = cleaned.replace(/,/g, "");
  return parseInt(number, 10) || 0;
}

/**
 * Fetch Play Store downloads by scraping the app page
 * @param packageName - Your app package name (e.g., 'com.savart')
 */
export async function fetchPlayStoreDownloadsScraper(
  packageName: string,
): Promise<number> {
  try {
    const url = `https://play.google.com/store/apps/details?id=${packageName}`;

    // Fetch the page with a user agent to avoid blocking
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Play Store page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try multiple selectors to find download count
    // The downloads text is usually in various places on the page
    let downloadsString = "";

    // Method 1: Look for text containing "Downloads" or "Installs"
    $("*").each((_, element) => {
      const text = $(element).text();
      // Look for patterns like "1,00,000+ Downloads" or "10M+ Downloads"
      const match = text.match(
        /([\d,\.]+[KML]?\+?)\s*(?:Downloads|Installs|downloads|installs)/i,
      );
      if (match && !downloadsString) {
        downloadsString = match[1];
      }
    });

    // Method 2: Look in specific meta tags or structured data
    if (!downloadsString) {
      const metaContent = $('meta[itemprop="numDownloads"]').attr("content");
      if (metaContent) {
        downloadsString = metaContent;
      }
    }

    // Method 3: Look for specific div classes that contain download info
    if (!downloadsString) {
      // Common class names that might contain download count
      // Found "100K+" in class "ClM7O" from Play Store HTML
      const possibleSelectors = [
        '[itemprop="numDownloads"]',
        ".ClM7O", // Downloads count container
        ".wVqUob .ClM7O", // Downloads section
        ".htlgb .htlgb",
        ".BgcNfc",
        ".AYi5wd",
      ];

      for (const selector of possibleSelectors) {
        const element = $(selector);
        element.each((_, el) => {
          const text = $(el).text().trim();
          // Check if this looks like a download count (e.g., "100K+", "1M+", "10,000+")
          if (/([\d,\.]+[KML]?\+?)/.test(text)) {
            const match = text.match(/([\d,\.]+[KML]?\+?)/);
            if (match && !downloadsString) {
              downloadsString = match[1];
            }
          }
        });
      }
    }

    // Method 4: Parse from page content - look for "Downloads" keyword and extract number nearby
    if (!downloadsString) {
      const pageText = $("body").text();
      // Look for patterns like "1,00,000+ Downloads" in the page text
      const downloadPatterns = [
        /([\d,\.]+[KML]?\+?)\s+Downloads/i,
        /([\d,\.]+[KML]?\+?)\s+Installs/i,
        /Downloads[:\s]+([\d,\.]+[KML]?\+?)/i,
        /Installs[:\s]+([\d,\.]+[KML]?\+?)/i,
      ];

      for (const pattern of downloadPatterns) {
        const match = pageText.match(pattern);
        if (match) {
          downloadsString = match[1];
          break;
        }
      }
    }

    if (!downloadsString) {
      throw new Error("Could not find download count on Play Store page");
    }

    // Parse the downloads string to a number
    const downloadsCount = parseDownloadsString(downloadsString);

    console.log(
      `Scraped downloads string: "${downloadsString}" -> ${downloadsCount}`,
    );

    return downloadsCount;
  } catch (error) {
    console.error("Error scraping Play Store:", error);
    throw error;
  }
}
