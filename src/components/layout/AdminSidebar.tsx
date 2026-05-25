import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SchoolTheme } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

const PRIMARY: { label: string; route: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Dashboard", route: "/(admin)/dashboard", icon: "home" },
  { label: "Students", route: "/(admin)/students", icon: "school" },
  { label: "Teachers", route: "/(admin)/teachers", icon: "people" },
  { label: "Notices", route: "/(admin)/notices", icon: "megaphone" },
  { label: "Settings", route: "/(admin)/settings", icon: "settings" },
];

const MORE: { label: string; route: string; icon: keyof typeof Ionicons.glyphMap; perm?: string }[] = [
  { label: "Fees", route: "/(admin)/fees", icon: "cash", perm: "viewFees" },
  { label: "Attendance", route: "/(admin)/attendance", icon: "calendar", perm: "markStudentAttendance" },
  { label: "Exams", route: "/(admin)/exams", icon: "stats-chart", perm: "viewExams" },
  { label: "Reports", route: "/(admin)/reports", icon: "bar-chart", perm: "viewReports" },
  { label: "Alerts", route: "/(admin)/notifications", icon: "notifications", perm: "viewNotifications" },
  { label: "Parents", route: "/(admin)/parents", icon: "heart", perm: "viewParents" },
  { label: "Masters", route: "/(admin)/masters", icon: "construct", perm: "manageMasters" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();
  const { can, userData, roleLabel } = usePermissions();

  const moreItems = MORE.filter((m) => !m.perm || can(m.perm as never));

  const NavItem = ({
    label,
    route,
    icon,
  }: {
    label: string;
    route: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const active = pathname.includes(route.replace("/(admin)/", ""));
    return (
      <TouchableOpacity
        onPress={() => router.push(route as never)}
        style={[styles.item, active && styles.itemActive]}
      >
        <Ionicons name={icon} size={20} color={active ? SchoolTheme.accent : "#94A3B8"} />
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.sidebar, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.brand}>Little Angel&apos;s</Text>
      <Text style={styles.role}>{roleLabel}</Text>
      <Text style={styles.user} numberOfLines={1}>
        {userData?.name}
      </Text>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Main</Text>
        {PRIMARY.map((item) => (
          <NavItem key={item.route} {...item} />
        ))}
        <Text style={[styles.section, { marginTop: 16 }]}>More</Text>
        {moreItems.map((item) => (
          <NavItem key={item.route} label={item.label} route={item.route} icon={item.icon} />
        ))}
      </ScrollView>
      <TouchableOpacity onPress={handleLogout} style={styles.logout}>
        <Ionicons name="log-out-outline" size={20} color={SchoolTheme.error} />
        <Text style={styles.logoutText}>Sign out</Text>
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
  brand: { fontSize: 15, fontWeight: "900", color: SchoolTheme.primary, paddingHorizontal: 8 },
  role: { fontSize: 10, fontWeight: "800", color: SchoolTheme.accent, marginTop: 2, paddingHorizontal: 8 },
  user: { fontSize: 12, color: SchoolTheme.textSecondary, marginTop: 4, marginBottom: 16, paddingHorizontal: 8 },
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
