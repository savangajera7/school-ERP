import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { SchoolTheme } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";

export default function AdminSettingsScreen() {
  const { handleLogout } = useAuth();
  const userData = useAuthStore((s) => s.userData);
  const { bodySize } = useResponsive();

  return (
    <View style={{ flex: 1 }}>
      <RoleHeader title="Settings" subtitle={userData?.email} />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/(admin)/profile" as never)}
        >
          <Text style={[styles.label, { fontSize: bodySize }]}>Profile</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/(admin)/change-password" as never)}
        >
          <Text style={[styles.label, { fontSize: bodySize }]}>Change password</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.danger]} onPress={handleLogout}>
          <Text style={[styles.label, { color: SchoolTheme.error, fontSize: bodySize }]}>
            Sign out
          </Text>
        </TouchableOpacity>
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    alignItems: "center",
  },
  label: { fontWeight: "700", color: SchoolTheme.text },
  chev: { fontSize: 22, color: "#9CA3AF" },
  danger: { marginTop: 24 },
});
