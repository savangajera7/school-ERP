import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack, usePathname, router } from "expo-router";
import { getHomeRoute } from "@/utils/roleRouting";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { DesktopSidebar } from "@/components/ui/DesktopSidebar";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { isMobileTabRoute } from "@/constants/mobileTabs";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuthStore } from "@/store/authStore";

export default function AppLayout() {
  const { isMobile } = useBreakpoint();
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showMobileTabs = isMobile && isMobileTabRoute(pathname, role);



  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" }}>
      {/* Desktop: Persistent Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        <RouteGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#F8FAFC" },
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
