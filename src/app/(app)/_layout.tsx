import React from "react";
import { View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { DesktopSidebar } from "@/components/ui/DesktopSidebar";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { isMobileTabRoute } from "@/constants/mobileTabs";

export default function AppLayout() {
  const { isMobile } = useBreakpoint();
  const pathname = usePathname();
  const showMobileTabs = isMobile && isMobileTabRoute(pathname);

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

        {showMobileTabs && (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
            }}
          >
            <BottomTabBar />
          </View>
        )}
      </View>
    </View>
  );
}
