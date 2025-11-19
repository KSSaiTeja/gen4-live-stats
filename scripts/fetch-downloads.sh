#!/bin/bash
# Script to fetch PlayStore downloads
# Run this every 4 hours via cron job

cd "$(dirname "$0")/.." || exit 1

# Run PHP script
php scripts/fetch-playstore-downloads.php

# Exit with script's exit code
exit $?

