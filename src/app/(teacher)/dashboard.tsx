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

const ACTIONS: { label: string; route: string; icon: AppIconName }[] = [
  { label: "Mark attendance", route: "/(teacher)/attendance", icon: "attendance" },
  { label: "Post homework", route: "/(teacher)/homework", icon: "homework" },
  { label: "Classwork", route: "/(teacher)/classwork", icon: "classwork" },
  { label: "Post notice", route: "/(teacher)/notice", icon: "notices" },
  { label: "Exam marks", route: "/(teacher)/exam-marks", icon: "exams" },
  { label: "Timetable", route: "/(teacher)/timetable", icon: "timetable" },
];

export default function TeacherDashboardScreen() {
  const { userData } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { isMobile, titleSize } = useResponsive();
  const firstName = userData?.name?.split(" ")[0] || "Teacher";

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: ROLE_TAB_BAR_HEIGHT + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0D9488", "#0F766E"]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <Text style={styles.welcome}>Teacher portal</Text>
          <Text style={[styles.userName, { fontSize: titleSize }]}>Hello, {firstName}</Text>
        </LinearGradient>

        <View style={[styles.body, isMobile && { marginTop: -24 }]}>
          {ACTIONS.map((a) => (
            <ActionListRow
              key={a.route}
              label={a.label}
              icon={a.icon}
              accentColor={SchoolTheme.teacher}
              iconBackground="#CCFBF1"
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
