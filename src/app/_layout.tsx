import React, { useEffect, useState } from "react";
import { Slot, SplashScreen } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
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

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0d3666" }} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Slot />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
