import React from "react";
import { View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { useColorScheme } from "nativewind";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopSidebar } from "@/components/ui/DesktopSidebar";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { isMobileTabRoute } from "@/constants/mobileTabs";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuthStore } from "@/store/authStore";

export default function AppLayout() {
  const { isMobile } = useResponsive();
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const showMobileTabs = isMobile && isMobileTabRoute(pathname, role);
  const { colorScheme } = useColorScheme();

  const bg = colorScheme === "dark" ? "#0F172A" : "#F8FAFC";

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: bg }}>
      {/* Single unified sidebar — role-aware nav items via usePermissions */}
      {!isMobile && <DesktopSidebar />}

      <View style={{ flex: 1 }}>
        <RouteGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: bg },
              animation: "fade",
            }}
          />
        </RouteGuard>

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
