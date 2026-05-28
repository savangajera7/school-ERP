import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SchoolTheme } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";

const PRIMARY: { label: string; route: string; icon: AppIconName }[] = [
  { label: "Dashboard", route: "/(super-admin)/dashboard", icon: "home" },
  { label: "Users", route: "/(super-admin)/users", icon: "users" },
  { label: "Roles", route: "/(super-admin)/roles", icon: "roles" },
  { label: "Settings", route: "/(super-admin)/settings", icon: "settings" },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();
  const { userData, roleLabel } = usePermissions();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const NavItem = ({
    label,
    route,
    icon,
  }: {
    label: string;
    route: string;
    icon: AppIconName;
  }) => {
    const active = pathname.includes(route.replace("/(super-admin)/", ""));
    return (
      <TouchableOpacity
        onPress={() => router.push(route as never)}
        style={[styles.item, active && styles.itemActive, isCollapsed && styles.itemCollapsed]}
      >
        <AppIcon
          name={icon}
          size={20}
          color={active ? SchoolTheme.primary : SchoolTheme.textSecondary}
          active={active}
        />
        {!isCollapsed && (
          <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.sidebar, { paddingTop: insets.top + 16 }, isCollapsed && styles.sidebarCollapsed]}>
      <View style={styles.headerRow}>
        {!isCollapsed && (
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>Super Admin</Text>
            <Text style={styles.role}>{roleLabel}</Text>
            <Text style={styles.user} numberOfLines={1}>
              {userData?.name}
            </Text>
          </View>
        )}
        <TouchableOpacity 
          onPress={() => setIsCollapsed(!isCollapsed)} 
          style={styles.collapseButton}
        >
          <AppIcon name={isCollapsed ? "chevronRight" : "chevronBack"} size={16} color="#374151" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isCollapsed && <Text style={styles.section}>Main Control</Text>}
        {PRIMARY.map((item) => (
          <NavItem key={item.route} {...item} />
        ))}
      </ScrollView>
      <TouchableOpacity onPress={handleLogout} style={[styles.logout, isCollapsed && styles.itemCollapsed]}>
        <AppIcon name="logout" size={20} color={SchoolTheme.error} />
        {!isCollapsed && <Text style={styles.logoutText}>Sign out</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: SchoolTheme.border,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  sidebarCollapsed: {
    width: 72,
    paddingHorizontal: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  brandContainer: {
    flex: 1,
  },
  collapseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  brand: { fontSize: 15, fontWeight: "900", color: SchoolTheme.primary },
  role: { fontSize: 10, fontWeight: "800", color: SchoolTheme.accent, marginTop: 2 },
  user: { fontSize: 12, color: SchoolTheme.textSecondary, marginTop: 4 },
  scroll: { flex: 1 },
  section: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  itemActive: {
    backgroundColor: SchoolTheme.primary + "10",
  },
  itemLabel: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "600",
    color: SchoolTheme.textSecondary,
  },
  itemLabelActive: {
    color: SchoolTheme.primary,
    fontWeight: "800",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: SchoolTheme.border,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "700",
    color: SchoolTheme.error,
  },
});
