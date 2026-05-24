#!/usr/bin/env node
/**
 * Writes wwwroot/downloads/manifest.json for school websites.
 * Usage: node scripts/generate-download-manifest.js [outputDir]
 */
const fs = require("fs");
const path = require("path");

const outputDir = process.argv[2] || path.join(process.cwd(), "artifacts", "downloads");
const baseUrl =
  process.env.PUBLIC_DOWNLOAD_BASE_URL ||
  "https://schoolmanagement.mahispark.com/downloads";
const apiBase =
  process.env.EXPO_PUBLIC_API_URL || "https://schoolmanagement.mahispark.com";
const version = process.env.APP_VERSION || require("../package.json").version;
const webAppUrl =
  process.env.PUBLIC_WEB_APP_URL || "https://app.schoolmanagement.mahispark.com";

const files = fs.existsSync(outputDir) ? fs.readdirSync(outputDir) : [];
const hasApk = files.some((f) => f.endsWith(".apk"));
const hasAab = files.some((f) => f.endsWith(".aab"));

const manifest = {
  appName: "School ERP",
  version,
  updatedAt: new Date().toISOString(),
  webAppUrl,
  android: hasApk
    ? { apk: `${baseUrl}/school-erp-latest.apk`, aab: hasAab ? `${baseUrl}/school-erp-latest.aab` : null }
    : null,
  ios: {
    appStoreUrl: process.env.IOS_APP_STORE_URL || null,
    note: "iOS builds are distributed via App Store when published.",
  },
  apiManifestUrl: `${apiBase}/api/Downloads/manifest`,
};

fs.mkdirSync(outputDir, { recursive: true });
const outPath = path.join(outputDir, "manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log("Wrote", outPath);
