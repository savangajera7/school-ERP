import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SchoolTheme } from "@/constants/theme";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import type { AppIconName } from "@/constants/appIcons";

const LINKS: { title: string; href: string; icon: AppIconName }[] = [
  { title: "Homework", href: "/(parent)/homework", icon: "homework" },
  { title: "Attendance", href: "/(parent)/attendance", icon: "attendance" },
  { title: "Fees & Dues", href: "/(parent)/fees", icon: "fees" },
  { title: "Syllabus", href: "/(parent)/syllabus", icon: "syllabus" },
  { title: "Timetable", href: "/(parent)/timetable", icon: "timetable" },
  { title: "Exam Marks", href: "/(parent)/exam-marks", icon: "exams" },
  { title: "Results", href: "/(parent)/result", icon: "results" },
  { title: "Notices", href: "/(parent)/notices", icon: "notices" },
  { title: "Profile", href: "/(parent)/profile", icon: "profile" },
];

export function ParentMenuScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: ROLE_TAB_BAR_HEIGHT + 24 }}>
        <LinearGradient
          colors={[SchoolTheme.primary, SchoolTheme.primaryDark]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <Text style={styles.title}>More</Text>
        </LinearGradient>
        <View style={styles.body}>
          {LINKS.map((link) => (
            <ActionListRow
              key={link.href}
              label={link.title}
              icon={link.icon}
              accentColor={SchoolTheme.parent}
              iconBackground="#E8EFF8"
              onPress={() => router.push(link.href as never)}
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
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "900" },
  body: { paddingHorizontal: 16, marginTop: -20, paddingTop: 8 },
});
