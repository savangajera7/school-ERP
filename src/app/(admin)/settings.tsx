import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { SchoolTheme } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { AppIcon } from "@/components/icons/AppIcon";

export default function AdminSettingsScreen() {
  const { handleLogout } = useAuth();
  const userData = useAuthStore((s) => s.userData);
  const { bodySize } = useResponsive();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const getRowStyle = () => ({
    ...styles.row,
    backgroundColor: isDark ? SchoolTheme.cardDark : "#fff",
    borderColor: isDark ? SchoolTheme.borderDark : SchoolTheme.border,
  });

  const getLabelStyle = () => ({
    ...styles.label,
    color: isDark ? SchoolTheme.textDark : SchoolTheme.text,
    fontSize: bodySize,
  });

  return (
    <View style={{ flex: 1 }}>
      <RoleHeader
        title="Settings"
        subtitle={userData?.email}
        flatHeader
      />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        <TouchableOpacity
          style={getRowStyle()}
          onPress={() => router.push("/(app)/profile" as never)}
        >
          <Text style={getLabelStyle()}>Profile</Text>
          <AppIcon name="chevronRight" size={20} color={isDark ? "#94A3B8" : "#9CA3AF"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={getRowStyle()}
          onPress={() => router.push("/(app)/change-password" as never)}
        >
          <Text style={getLabelStyle()}>Change password</Text>
          <AppIcon name="chevronRight" size={20} color={isDark ? "#94A3B8" : "#9CA3AF"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[getRowStyle(), styles.danger]}
          onPress={handleLogout}
        >
          <Text style={[getLabelStyle(), { color: SchoolTheme.error }]}>
            Sign out
          </Text>
          <AppIcon name="logout" size={20} color={SchoolTheme.error} />
        </TouchableOpacity>
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    alignItems: "center",
  },
  label: { fontWeight: "700" },
  danger: { marginTop: 24 },
});
