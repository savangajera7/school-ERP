import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SchoolTheme } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDisplayName } from "@/utils/helpers";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";

const PRIMARY: { label: string; route: string; icon: AppIconName }[] = [
  { label: "Dashboard", route: "/(admin)/dashboard", icon: "home" },
  { label: "Students", route: "/(admin)/students", icon: "students" },
  { label: "Teachers", route: "/(admin)/teachers", icon: "teachers" },
  { label: "Notices", route: "/(admin)/notices", icon: "notices" },
  { label: "Settings", route: "/(admin)/settings", icon: "settings" },
];

const MORE: { label: string; route: string; icon: AppIconName; perm?: string }[] = [
  { label: "Fees", route: "/(admin)/fees", icon: "fees", perm: "viewFees" },
  { label: "Attendance", route: "/(app)/attendance", icon: "attendance", perm: "markStudentAttendance" },
  { label: "Exams", route: "/(admin)/exams", icon: "exams", perm: "viewExams" },
  { label: "Reports", route: "/(app)/reports", icon: "reports", perm: "viewReports" },
  { label: "Alerts", route: "/(admin)/notifications", icon: "notifications", perm: "viewNotifications" },
  { label: "Masters", route: "/(admin)/masters", icon: "masters", perm: "manageMasters" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();
  const { can, userData, roleLabel } = usePermissions();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const moreItems = MORE.filter((m) => !m.perm || can(m.perm as never));

  const NavItem = ({
    label,
    route,
    icon,
  }: {
    label: string;
    route: string;
    icon: AppIconName;
  }) => {
    const routeKey = route.replace(/^\([^)]+\)\//, "");
    const active =
      pathname.includes(routeKey) ||
      (routeKey === "attendance" && pathname.includes("/attendance"));
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
            <Text style={styles.brand}>Little Angel&apos;s</Text>
            <Text style={styles.role}>{roleLabel}</Text>
            <Text style={styles.user} numberOfLines={1}>
              {formatDisplayName(userData?.name)}
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
        {!isCollapsed && <Text style={styles.section}>Main</Text>}
        {PRIMARY.map((item) => (
          <NavItem key={item.route} {...item} />
        ))}
        {!isCollapsed && <Text style={[styles.section, { marginTop: 16 }]}>More</Text>}
        {moreItems.map((item) => (
          <NavItem key={item.route} label={item.label} route={item.route} icon={item.icon} />
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
    fontWeight: "800",
    color: SchoolTheme.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    minHeight: 48,
  },
  itemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  itemActive: { backgroundColor: `${SchoolTheme.primary}14` },
  itemLabel: { fontSize: 14, fontWeight: "600", color: SchoolTheme.textSecondary },
  itemLabelActive: { color: SchoolTheme.primary, fontWeight: "800" },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    minHeight: 48,
  },
  logoutText: { color: SchoolTheme.error, fontWeight: "700" },
});
