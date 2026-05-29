import React, { useEffect, useState } from "react";
import { SplashScreen } from "expo-router";
import { AuthGate } from "@/components/auth/AuthGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { PremiumLoadingScreen } from "@/components/ui/PremiumLoadingScreen";
import { ToastProvider } from "@/components/ui/Toast";
import { AppDialogProvider } from "@/components/ui/AppDialog";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AppUpdateModal } from "@/components/updates/AppUpdateModal";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import "../../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const appUpdate = useAppUpdate();

  useEffect(() => {
    // Simulate some loading time for assets/fonts if needed
    const prepare = async () => {
      try {
        console.log("Preparing root layout...");
        // Here you would load fonts or other assets
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn("Layout preparation error:", e);
      } finally {
        console.log("Root layout ready, hiding splash...");
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.warn("SplashScreen hide error:", splashError);
        }
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let cleanup = () => {};
    void import("@/services/notifications/pushService").then((m) => {
      cleanup = m.setupNotificationListeners();
    });
    return () => cleanup();
  }, []);

  if (!isReady) {
    return <PremiumLoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ToastProvider>
          <AppDialogProvider>
            <NotificationProvider>
              <StatusBar style="dark" />
              <AuthGate />
              <AppUpdateModal
                visible={appUpdate.visible}
                manifest={appUpdate.manifest}
                apkUrl={appUpdate.apkUrl}
                installedVersion={appUpdate.installedVersion}
                onDismiss={appUpdate.dismiss}
              />
            </NotificationProvider>
          </AppDialogProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
