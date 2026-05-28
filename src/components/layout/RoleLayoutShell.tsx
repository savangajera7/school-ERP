import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { usePathname } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { RoleTabBar, ROLE_TAB_BAR_HEIGHT, type TabDef } from "@/components/layout/RoleTabBar";
import { DesktopSidebar } from "@/components/ui/DesktopSidebar";

type Props = {
  children?: React.ReactNode;
  tabs?: TabDef[];
  tabAccent?: string;
  /** Paths that show bottom tabs on mobile (basename match) */
  tabRoutes?: string[];
  /** Keep prop for backwards compat but it's no longer used — DesktopSidebar is always role-aware */
  sidebar?: "admin" | "super_admin" | "teacher" | "parent" | null;
};

export function RoleLayoutShell({
  tabs = [],
  tabAccent,
  tabRoutes = [],
  sidebar = null,
}: Props) {
  const pathname = usePathname();
  const { isMobile, isTablet, isWeb } = useResponsive();

  // Show sidebar on tablet/web for roles that have one (admin, super_admin).
  // teacher/parent/student have no desktop sidebar — sidebar prop signals intent.
  const showSidebar = (isTablet || isWeb) && sidebar !== null;

  const showTabs =
    isMobile &&
    tabs.length > 0 &&
    tabRoutes.some((r) => pathname.includes(r) || pathname.endsWith(r));

  return (
    <View style={styles.root}>
      {/* Single unified sidebar — nav items are role-aware inside DesktopSidebar */}
      {showSidebar && <DesktopSidebar />}

      <View style={styles.main}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F4F6FA" },
            animation: "fade",
          }}
        />
        {showTabs && (
          <View style={styles.tabOverlay}>
            <RoleTabBar tabs={tabs} accent={tabAccent} />
          </View>
        )}
      </View>
    </View>
  );
}

export function tabBarPadding(showTabs: boolean): number {
  return showTabs ? ROLE_TAB_BAR_HEIGHT + 8 : 0;
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: "#F4F6FA" },
  main: { flex: 1 },
  tabOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
});
