# Cron Job Setup for PlayStore Downloads

## Option 1: Local Cron Job (Linux/Mac)

Edit your crontab:
```bash
crontab -e
```

Add this line to run every 4 hours:
```bash
0 */4 * * * cd /path/to/gen4-live-stats && php scripts/fetch-playstore-downloads.php >> /path/to/gen4-live-stats/logs/cron.log 2>&1
```

## Option 2: Vercel Cron Job (Recommended for Production)

Add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-downloads",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

Then create the API route that calls your PHP script (or better, use a Node.js version).

## Option 3: GitHub Actions (If using Git)

Create `.github/workflows/fetch-downloads.yml`:

```yaml
name: Fetch PlayStore Downloads

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      - name: Install dependencies
        run: composer install
      - name: Fetch downloads
        run: php scripts/fetch-playstore-downloads.php
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/downloads.json
          git commit -m "Update downloads" || exit 0
          git push
```

## Testing

Test the script manually:
```bash
php scripts/fetch-playstore-downloads.php
```

Check if `data/downloads.json` was updated.

