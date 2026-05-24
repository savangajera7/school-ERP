#!/usr/bin/env bash
# Download latest successful Android APK from EAS and upload to API server.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ARTIFACTS_DIR="${ARTIFACTS_DIR:-$ROOT/artifacts/downloads}"
APK_NAME="school-erp-latest.apk"
SERVER_USER="${SERVER_USERNAME:-savan}"
SERVER_HOST="${SERVER_IP:-94.136.191.175}"
DL_PATH="${SERVER_DOWNLOADS_PATH:-/var/www/schoolmanagementapi/wwwroot/downloads}"

mkdir -p "$ARTIFACTS_DIR"

echo "→ Fetching latest finished Android build from EAS…"
BUILD_JSON="$(eas build:list --platform android --status finished --limit 1 --json --non-interactive)"
BUILD_ID="$(echo "$BUILD_JSON" | node -e "
  const j=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const b=Array.isArray(j)?j[0]:j;
  if(!b?.id) process.exit(1);
  console.log(b.id);
")"
APK_URL="$(echo "$BUILD_JSON" | node -e "
  const j=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const b=Array.isArray(j)?j[0]:j;
  const u=b?.artifacts?.applicationArchiveUrl||b?.artifacts?.buildUrl;
  if(!u) process.exit(1);
  console.log(u);
")"

echo "   Build ID: $BUILD_ID"
echo "→ Downloading APK…"

if eas build:download --help 2>&1 | grep -q build-id; then
  (cd "$ARTIFACTS_DIR" && eas build:download --build-id "$BUILD_ID" --non-interactive)
  DOWNLOADED="$(find "$ARTIFACTS_DIR" -maxdepth 1 -name '*.apk' -type f | head -1)"
  if [[ -n "$DOWNLOADED" ]]; then
    cp "$DOWNLOADED" "$ARTIFACTS_DIR/$APK_NAME"
  fi
fi

if [[ ! -f "$ARTIFACTS_DIR/$APK_NAME" ]]; then
  curl -fsSL "$APK_URL" -o "$ARTIFACTS_DIR/$APK_NAME"
fi

echo "→ Generating manifest.json…"
EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-https://schoolmanagement.mahispark.com}" \
  PUBLIC_DOWNLOAD_BASE_URL="${PUBLIC_DOWNLOAD_BASE_URL:-https://schoolmanagement.mahispark.com/downloads}" \
  PUBLIC_WEB_APP_URL="${PUBLIC_WEB_APP_URL:-https://app.schoolmanagement.mahispark.com}" \
  node scripts/generate-download-manifest.js "$ARTIFACTS_DIR"

echo "→ Uploading to ${SERVER_USER}@${SERVER_HOST}:${DL_PATH}/ …"
ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${DL_PATH}"
scp "$ARTIFACTS_DIR/$APK_NAME" "$ARTIFACTS_DIR/manifest.json" \
  "${SERVER_USER}@${SERVER_HOST}:${DL_PATH}/"

echo "✓ Done. APK: https://schoolmanagement.mahispark.com/downloads/${APK_NAME}"
echo "  Manifest: https://schoolmanagement.mahispark.com/api/Downloads/manifest"
