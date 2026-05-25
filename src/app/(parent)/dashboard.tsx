import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { useAuthStore } from "@/store/authStore";
import { SchoolTheme } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";

const LINKS = [
  { label: "Homework", route: "/(parent)/homework", icon: "📚" },
  { label: "Attendance", route: "/(parent)/attendance", icon: "📅" },
  { label: "Results", route: "/(parent)/result", icon: "🏆" },
  { label: "Notices", route: "/(parent)/notices", icon: "📢" },
];

export default function ParentDashboardScreen() {
  const { userData, role } = useAuthStore();
  const { bodySize } = useResponsive();

  return (
    <View style={{ flex: 1 }}>
      <RoleHeader title="Parent" accentColor={SchoolTheme.parent} />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        <DashboardGreeting name={userData?.name ?? "Parent"} role={role} />
        {LINKS.map((a) => (
          <TouchableOpacity
            key={a.route}
            style={styles.row}
            onPress={() => router.push(a.route as never)}
          >
            <Text style={styles.icon}>{a.icon}</Text>
            <Text style={[styles.label, { fontSize: bodySize }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    minHeight: 56,
  },
  icon: { fontSize: 22 },
  label: { fontWeight: "700", color: SchoolTheme.text },
});
