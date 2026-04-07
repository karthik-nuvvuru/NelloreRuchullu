#!/usr/bin/env bash
# Generate a demo video from Playwright E2E test recordings
# Requires: ffmpeg installed
# Playwright already captures video on failure; this script:
#   1. Runs E2E tests in headed mode with video capture
#   2. Concatenates video clips into a demo reel
#
# Usage: npm run test:e2e  # videos already captured by Playwright

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
VIDEO_DIR="$ROOT_DIR/test-results"
OUTPUT_DIR="$ROOT_DIR/tests/demo"

mkdir -p "$OUTPUT_DIR"

# Check for test result videos
if [ ! -d "$VIDEO_DIR" ]; then
  echo "No test results found. Run tests first: npm run test:e2e"
  exit 1
fi

VIPS=$(find "$VIDEO_DIR" -name "*.webm" 2>/dev/null | head -20)
if [ -z "$VIPS" ]; then
  echo "No video recordings found in $VIDEO_DIR"
  exit 1
fi

echo "Found videos:"
echo "$VIPS" | nl

# Create concat list for ffmpeg
CONCAT_LIST=$(mktemp)
find "$VIDEO_DIR" -name "*.webm" | sort | while read -r f; do
  echo "file '$f'" >> "$CONCAT_LIST"
done

# Generate demo video
OUTPUT_FILE="$OUTPUT_DIR/demo-$(date +%Y%m%d-%H%M%S).mp4"

echo "Generating demo video: $OUTPUT_FILE"
ffmpeg -f concat -safe 0 -i "$CONCAT_LIST" \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -y "$OUTPUT_FILE" 2>/dev/null

rm -f "$CONCAT_LIST"

echo "Demo video saved to: $OUTPUT_FILE"
