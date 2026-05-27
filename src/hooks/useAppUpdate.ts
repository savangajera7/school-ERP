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
        Alert.alert(
          "Update Available",
          "A new version of the app is available. Would you like to update now?",
          [
            { text: "Later", style: "cancel" },
            { 
              text: "Update", 
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (e) {
                  Alert.alert("Update Error", "Failed to apply update.");
                }
              }
            }
          ]
        );
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
