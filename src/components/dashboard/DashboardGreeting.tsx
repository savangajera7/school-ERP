import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";
import type { Role } from "@/types/auth.types";

const ROLE_GRADIENT: Record<string, [string, string]> = {
  admin: [SchoolTheme.primary, SchoolTheme.primaryLight],
  superadmin: [SchoolTheme.primaryDark, SchoolTheme.primary],
  teacher: [SchoolTheme.primary, SchoolTheme.primaryLight],
  parent: [SchoolTheme.primary, SchoolTheme.primaryLight],
  student: [SchoolTheme.primary, SchoolTheme.primaryLight],
};

const ROLE_SUBTITLE: Record<string, string> = {
  admin: "Manage school operations, fees, and reports.",
  superadmin: "Full platform access for your school.",
  teacher: "Post homework, mark attendance, and enter exam marks.",
  parent: "View your child's homework, attendance, and results.",
  student: "View homework, timetable, and exam results.",
};

type Props = {
  name: string;
  role: Role | null;
};

export function DashboardGreeting({ name, role }: Props) {
  const { titleSize, bodySize, padding } = useResponsive();
  const r = role ?? "parent";
  const colors = ROLE_GRADIENT[r] ?? ROLE_GRADIENT.parent;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { marginHorizontal: 0, padding }]}
    >
      <Text style={[styles.hello, { fontSize: bodySize }]}>Welcome back,</Text>
      <Text style={[styles.name, { fontSize: titleSize }]} numberOfLines={2}>
        {name.split(" ")[0] || "User"}
      </Text>
      <Text style={[styles.sub, { fontSize: bodySize }]}>{ROLE_SUBTITLE[r]}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {r === "super_admin" || r === "admin" ? "Administrator" : r === "teacher" ? "Teacher" : "Parent Portal"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  hello: { color: "rgba(255,255,255,0.9)", fontWeight: "600" },
  name: { color: "#fff", fontWeight: "900", marginTop: 4 },
  sub: { color: "rgba(255,255,255,0.85)", marginTop: 8, lineHeight: 22 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: SchoolTheme.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "800", color: SchoolTheme.primaryDark },
});
