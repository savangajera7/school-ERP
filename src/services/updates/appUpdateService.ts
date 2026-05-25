import { Platform, Linking } from "react-native";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { API_BASE_URL } from "@/constants/api";

export type DownloadManifest = {
  appName?: string;
  version?: string;
  updatedAt?: string;
  android?: { apk?: string | null; aab?: string | null };
};

function parseVersion(v: string): number[] {
  return v.split(".").map((n) => parseInt(n.replace(/\D/g, ""), 10) || 0);
}

/** Returns true if remote is newer than installed app version. */
export function isNewerVersion(remote: string, current: string): boolean {
  const r = parseVersion(remote);
  const c = parseVersion(current);
  const len = Math.max(r.length, c.length);
  for (let i = 0; i < len; i++) {
    const rv = r[i] ?? 0;
    const cv = c[i] ?? 0;
    if (rv > cv) return true;
    if (rv < cv) return false;
  }
  return false;
}

export function getInstalledVersion(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

export async function fetchDownloadManifest(): Promise<DownloadManifest | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/Downloads/manifest`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as DownloadManifest;
  } catch {
    return null;
  }
}

export async function checkForAppUpdate(): Promise<{
  hasUpdate: boolean;
  manifest: DownloadManifest | null;
  apkUrl: string | null;
  installedVersion: string;
}> {
  const installedVersion = getInstalledVersion();
  const manifest = await fetchDownloadManifest();
  const apkUrl = manifest?.android?.apk ?? null;
  const remoteVersion = manifest?.version ?? installedVersion;
  const hasUpdate =
    Platform.OS === "android" &&
    !!apkUrl &&
    isNewerVersion(remoteVersion, installedVersion);

  return { hasUpdate, manifest, apkUrl, installedVersion };
}

/** Download APK and open Android package installer (in-app update). */
export async function installAndroidApk(apkUrl: string): Promise<void> {
  if (Platform.OS !== "android") {
    await Linking.openURL(apkUrl);
    return;
  }

  const dest = `${FileSystem.cacheDirectory}school-erp-update.apk`;
  const download = await FileSystem.downloadAsync(apkUrl, dest);
  const contentUri = await FileSystem.getContentUriAsync(download.uri);

  try {
    await IntentLauncher.startActivityAsync("android.intent.action.INSTALL_PACKAGE", {
      data: contentUri,
      flags: 1,
    });
  } catch {
    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      type: "application/vnd.android.package-archive",
      flags: 1,
    });
  }
}
