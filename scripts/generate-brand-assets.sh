#!/usr/bin/env bash
# Regenerate launcher icons and splash from assets/school-logo.png
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/assets"
LOGO="school-logo.png"
if [[ ! -f "$LOGO" ]]; then
  echo "Missing $ROOT/assets/$LOGO"
  exit 1
fi
magick "$LOGO" -resize 82% -background none -gravity center -extent 1024x1024 PNG32:icon-temp.png
magick -size 1024x1024 xc:"#0d3666" icon-temp.png -gravity center -composite icon.png
magick icon-temp.png -background none -gravity center -extent 1024x1024 adaptive-icon.png
magick -size 1024x1024 xc:"#0d3666" \( "$LOGO" -resize 55% \) -gravity center -composite splash-icon.png
magick "$LOGO" -resize 32x32 favicon.png
rm -f icon-temp.png
echo "✓ Generated icon.png, adaptive-icon.png, splash-icon.png, favicon.png"
