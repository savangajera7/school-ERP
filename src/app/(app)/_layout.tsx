import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { DesktopSidebar } from "@/components/ui/DesktopSidebar";

export default function AppLayout() {
  const { isMobile } = useBreakpoint();

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" }}>
      {/* Desktop: Persistent Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F8FAFC" },
            animation: "fade",
          }}
        />
      </View>
    </View>
  );
}
