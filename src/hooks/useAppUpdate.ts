import { useEffect, useState, useCallback } from "react";
import { Platform, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  checkForAppUpdate,
  type DownloadManifest,
} from "@/services/updates/appUpdateService";

const DISMISS_KEY = "app_update_dismissed_version";

export function useAppUpdate() {
  const [visible, setVisible] = useState(false);
  const [manifest, setManifest] = useState<DownloadManifest | null>(null);
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [installedVersion, setInstalledVersion] = useState("1.0.0");

  const runCheck = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const result = await checkForAppUpdate();
    setInstalledVersion(result.installedVersion);
    if (!result.hasUpdate || !result.manifest?.version) {
      setVisible(false);
      return;
    }
    const dismissed = await AsyncStorage.getItem(DISMISS_KEY);
    if (dismissed === result.manifest.version) return;
    setManifest(result.manifest);
    setApkUrl(result.apkUrl);
    setVisible(true);
  }, []);

  useEffect(() => {
    runCheck();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") runCheck();
    });
    return () => sub.remove();
  }, [runCheck]);

  const dismiss = useCallback(async () => {
    if (manifest?.version) {
      await AsyncStorage.setItem(DISMISS_KEY, manifest.version);
    }
    setVisible(false);
  }, [manifest?.version]);

  return { visible, manifest, apkUrl, installedVersion, dismiss };
};
