import { useEffect, useState, useCallback } from "react";
import { AppState, Alert, Platform } from "react-native";
import * as Updates from 'expo-updates';

export function useAppUpdate() {
  const [visible, setVisible] = useState(false);
  const [manifest, setManifest] = useState<any>(null);
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [installedVersion, setInstalledVersion] = useState("1.0.0");

  const runCheck = useCallback(async () => {
    // Skip in development
    if (__DEV__) return;
    
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        // Amazon/Instagram style: Silent background download
        await Updates.fetchUpdateAsync();
        // The update is now downloaded and waiting. 
        // It will automatically apply the NEXT time the user fully closes and reopens the app!
      }
    } catch (error) {
      console.log("Error checking for EAS updates:", error);
    }
  }, []);

  useEffect(() => {
    runCheck();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") runCheck();
    });
    return () => sub.remove();
  }, [runCheck]);

  const dismiss = useCallback(async () => {
    setVisible(false);
  }, []);

  return { visible, manifest, apkUrl, installedVersion, dismiss };
};
