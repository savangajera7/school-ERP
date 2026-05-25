import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { SchoolTheme } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import type { AppIconName } from "@/constants/appIcons";

const LINKS: { label: string; route: string; icon: AppIconName }[] = [
  { label: "Homework", route: "/(parent)/homework", icon: "homework" },
  { label: "Attendance", route: "/(parent)/attendance", icon: "attendance" },
  { label: "Exams", route: "/(parent)/exam", icon: "exams" },
  { label: "Results", route: "/(parent)/result", icon: "results" },
  { label: "Timetable", route: "/(parent)/timetable", icon: "timetable" },
  { label: "Notices", route: "/(parent)/notices", icon: "notices" },
];

export default function ParentDashboardScreen() {
  const { userData } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { isMobile, titleSize } = useResponsive();
  const firstName = userData?.name?.split(" ")[0] || "Parent";

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: ROLE_TAB_BAR_HEIGHT + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#7C3AED", "#5B21B6"]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <Text style={styles.welcome}>Parent portal</Text>
          <Text style={[styles.userName, { fontSize: titleSize }]}>Hello, {firstName}</Text>
        </LinearGradient>

        <View style={[styles.body, isMobile && { marginTop: -24 }]}>
          {LINKS.map((a) => (
            <ActionListRow
              key={a.route}
              label={a.label}
              icon={a.icon}
              accentColor={SchoolTheme.parent}
              iconBackground="#F3E8FF"
              onPress={() => router.push(a.route as never)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SchoolTheme.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  welcome: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userName: { color: "#fff", fontWeight: "900", marginTop: 4 },
  body: { paddingHorizontal: 16, paddingTop: 12 },
});
