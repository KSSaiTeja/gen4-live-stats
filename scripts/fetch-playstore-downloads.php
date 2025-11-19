<?php
/**
 * Script to fetch PlayStore downloads using google-play-scraper
 * Run this every 4 hours via cron job
 * 
 * Usage: php scripts/fetch-playstore-downloads.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Raulr\GooglePlayScraper\Scraper;

// Configuration
$packageName = 'com.savart'; // Your app package name
$downloadsJsonPath = __DIR__ . '/../data/downloads.json';

try {
    // Create scraper instance
    $scraper = new Scraper();
    
    // Optional: Set delay to avoid being blocked (in milliseconds)
    $scraper->setDelay(1000); // 1 second delay
    
    // Fetch app data
    echo "Fetching app data for: $packageName\n";
    $app = $scraper->getApp($packageName);
    
    // Parse downloads count from string like "10,000,000+" or "1L+"
    $downloadsString = $app['downloads'] ?? '0';
    echo "Raw downloads string: $downloadsString\n";
    
    // Convert formatted string to number
    // Handles: "10,000,000+", "1L+", "1,00,000+", etc.
    $downloadsCount = parseDownloadsString($downloadsString);
    echo "Parsed downloads count: $downloadsCount\n";
    
    // Read existing JSON file
    $existingData = [];
    if (file_exists($downloadsJsonPath)) {
        $existingContent = file_get_contents($downloadsJsonPath);
        $existingData = json_decode($existingContent, true) ?? [];
    }
    
    // Update playstore value
    $existingData['playstore'] = $downloadsCount;
    $existingData['lastUpdated'] = date('c'); // ISO 8601 format
    
    // Write back to file
    $jsonContent = json_encode($existingData, JSON_PRETTY_PRINT);
    file_put_contents($downloadsJsonPath, $jsonContent);
    
    echo "Successfully updated downloads.json with PlayStore count: $downloadsCount\n";
    echo "File saved to: $downloadsJsonPath\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

/**
 * Parse downloads string to number
 * Handles formats like: "10,000,000+", "1L+", "1,00,000+", "50,000+", etc.
 */
function parseDownloadsString($downloadsString) {
    if (empty($downloadsString) || $downloadsString === 'null') {
        return 0;
    }
    
    // Remove + sign and trim
    $cleaned = str_replace('+', '', trim($downloadsString));
    
    // Handle Indian numbering system (L = Lakhs = 100,000)
    if (stripos($cleaned, 'L') !== false) {
        $number = (float) str_replace(['L', 'l', ','], '', $cleaned);
        return (int) ($number * 100000);
    }
    
    // Handle M (Millions)
    if (stripos($cleaned, 'M') !== false) {
        $number = (float) str_replace(['M', 'm', ','], '', $cleaned);
        return (int) ($number * 1000000);
    }
    
    // Handle K (Thousands)
    if (stripos($cleaned, 'K') !== false) {
        $number = (float) str_replace(['K', 'k', ','], '', $cleaned);
        return (int) ($number * 1000);
    }
    
    // Handle regular numbers with commas
    $number = str_replace(',', '', $cleaned);
    return (int) $number;
}

