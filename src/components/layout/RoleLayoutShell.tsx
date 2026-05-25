import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { usePathname } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { RoleTabBar, ROLE_TAB_BAR_HEIGHT, type TabDef } from "@/components/layout/RoleTabBar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";

type Props = {
  children?: React.ReactNode;
  tabs?: TabDef[];
  tabAccent?: string;
  /** Paths that show bottom tabs on mobile (basename match) */
  tabRoutes?: string[];
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
  const showSidebar = (isTablet || isWeb) && sidebar !== null;
  const showTabs =
    isMobile &&
    tabs.length > 0 &&
    tabRoutes.some((r) => pathname.includes(r) || pathname.endsWith(r));

  return (
    <View style={styles.root}>
      {showSidebar && (
        sidebar === "super_admin" ? <SuperAdminSidebar /> : <AdminSidebar />
      )}
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
