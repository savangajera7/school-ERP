import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { SchoolTheme } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";

const LINKS: {
  title: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { title: "Syllabus", href: "/(parent)/syllabus", icon: "list" },
  { title: "Timetable", href: "/(parent)/timetable", icon: "calendar" },
  { title: "Exam Marks", href: "/(parent)/exam-marks", icon: "stats-chart" },
  { title: "Results", href: "/(parent)/result", icon: "trophy" },
  { title: "Notices", href: "/(parent)/notices", icon: "megaphone" },
  { title: "Profile", href: "/(parent)/profile", icon: "person" },
];

export function ParentMenuScreen() {
  const { bodySize } = useResponsive();

  return (
    <View style={{ flex: 1 }}>
      <RoleHeader title="More" accentColor={SchoolTheme.parent} />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        {LINKS.map((link) => (
          <TouchableOpacity
            key={link.href}
            style={styles.row}
            onPress={() => router.push(link.href as never)}
          >
            <Ionicons name={link.icon} size={24} color={SchoolTheme.parent} />
            <Text style={[styles.label, { fontSize: bodySize }]}>{link.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
    gap: 14,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    minHeight: 56,
  },
  label: { flex: 1, fontWeight: "700", color: SchoolTheme.text },
});
