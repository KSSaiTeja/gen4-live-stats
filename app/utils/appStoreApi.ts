/**
 * App Store Connect API integration
 * Fetches total downloads/installs from App Store Connect
 */

interface AppStoreCredentials {
  keyId: string;
  issuerId: string;
  privateKey: string;
}

/**
 * Generate JWT token for App Store Connect API
 */
async function generateAppStoreJWT(credentials: AppStoreCredentials): Promise<string> {
  const jwt = await import('jsonwebtoken');
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      iss: credentials.issuerId,
      iat: now,
      exp: now + 1200, // 20 minutes
      aud: 'appstoreconnect-v1',
    },
    credentials.privateKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: credentials.keyId,
        typ: 'JWT',
      },
    }
  );

  return token;
}

/**
 * Fetch total downloads from App Store Connect
 * Requires: App ID (e.g., '1234567890')
 */
export async function fetchAppStoreDownloads(
  appId: string,
  credentials?: AppStoreCredentials
): Promise<number> {
  try {
    // Get credentials from environment or parameter
    let creds = credentials;
    if (!creds) {
      const keyId = process.env.APPSTORE_KEY_ID;
      const issuerId = process.env.APPSTORE_ISSUER_ID;
      const privateKeyPath = process.env.APPSTORE_PRIVATE_KEY_PATH;
      const privateKeyContent = process.env.APPSTORE_PRIVATE_KEY;

      if (!keyId || !issuerId || (!privateKeyPath && !privateKeyContent)) {
        throw new Error('App Store Connect credentials not found in environment');
      }

      let privateKey = privateKeyContent;
      if (privateKeyPath && !privateKey) {
        // Read from file if path is provided
        const fs = await import('fs');
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      }

      if (!privateKey) {
        throw new Error('App Store private key not found');
      }

      // Handle key format (may include header/footer, strip them)
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s/g, '');

      creds = {
        keyId,
        issuerId,
        privateKey: privateKeyContent || `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`,
      };
    }

    // Generate JWT token
    const token = await generateAppStoreJWT(creds);

    // Fetch app analytics from App Store Connect API
    // Note: App Store Connect API requires app-specific queries
    // You may need to use the Reports API or Sales and Trends API
    const response = await fetch(
      `https://api.appstoreconnect.apple.com/v1/apps/${appId}/appStoreVersions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Try alternative endpoint - Sales and Trends API
      // This requires a different approach - using sales reports
      const salesResponse = await fetch(
        `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportType]=SALES&filter[reportSubType]=SUMMARY`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        // Parse sales report data to get total downloads
        // Structure: salesData.data contains report URLs
        // You'd need to download and parse the CSV reports
        // For now, return 0 and log that manual implementation needed
        console.warn('Sales Reports API requires CSV parsing - implement report download');
        return 0;
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(`App Store Connect API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    // App Store Connect doesn't directly provide download counts in standard API
    // You need to use Sales and Trends reports which are CSV files
    // For a simpler approach, you might want to use a different endpoint
    // Or implement CSV report parsing
    
    return 0; // Placeholder - implement based on actual API response structure
  } catch (error) {
    console.error('Error fetching AppStore downloads:', error);
    throw error;
  }
}

/**
 * Alternative: Fetch from App Store Connect using Sales Reports
 * This requires downloading and parsing CSV reports
 */
export async function fetchAppStoreDownloadsFromReports(
  appId: string,
  credentials: AppStoreCredentials
): Promise<number> {
  try {
    const token = await generateAppStoreJWT(credentials);

    // Get sales report URL
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - 1); // Yesterday's report
    const dateStr = reportDate.toISOString().split('T')[0].replace(/-/g, '');

    const response = await fetch(
      `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${dateStr}&filter[reportType]=SALES&filter[vendorNumber]=YOUR_VENDOR_NUMBER`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sales report: ${response.status}`);
    }

    // Download CSV report
    const csvText = await response.text();
    
    // Parse CSV to get total downloads
    // CSV format: Provider,Provider Country,SKU,Developer,Title,Version,Product Type Identifier,Units,Developer Proceeds, Begin Date, End Date, Customer Currency, Country Code, Currency of Proceeds, Apple Identifier, Customer Price, Promo Code, Parent Identifier, Subscription, Period, Category,CMB,Device,Supported Platforms,Proceeds Reason,Preserved Pricing,Client,Offer Type
    const lines = csvText.split('\n').filter(line => line.trim());
    let totalUnits = 0;

    for (let i = 1; i < lines.length; i++) { // Skip header
      const columns = lines[i].split('\t');
      if (columns.length > 7) {
        const units = parseInt(columns[7] || '0', 10);
        if (!isNaN(units)) {
          totalUnits += units;
        }
      }
    }

    return totalUnits;
  } catch (error) {
    console.error('Error fetching from sales reports:', error);
    throw error;
  }
}

