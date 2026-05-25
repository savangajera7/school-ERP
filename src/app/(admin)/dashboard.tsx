import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

const QUICK: { label: string; route: string; icon: string }[] = [
  { label: "Fees", route: "/(admin)/fees", icon: "💰" },
  { label: "Attendance", route: "/(admin)/attendance", icon: "📝" },
  { label: "Exams", route: "/(admin)/exams", icon: "📊" },
  { label: "Reports", route: "/(admin)/reports", icon: "📈" },
  { label: "Parents", route: "/(admin)/parents", icon: "👨‍👩‍👧" },
  { label: "Alerts", route: "/(admin)/notifications", icon: "🔔" },
];

export default function AdminDashboardScreen() {
  const { userData, role } = useAuthStore();
  const { columns, bodySize, titleSize } = useResponsive();
  const { data: studentsData, isLoading: ls } = useGetApiStudentGet();
  const { data: teachersData, isLoading: lt } = useGetApiTeacherGetTeacherList();
  const students = parseApiList(studentsData?.data);
  const teachers = parseApiList(teachersData?.data);
  const loading = ls || lt;

  return (
    <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
      <DashboardGreeting name={userData?.name ?? "Admin"} role={role} />
      {loading ? (
        <SkeletonLoader rows={2} />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statN, { fontSize: titleSize }]}>{students.length}</Text>
            <Text style={{ fontSize: bodySize, color: SchoolTheme.textSecondary }}>Students</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statN, { fontSize: titleSize }]}>{teachers.length}</Text>
            <Text style={{ fontSize: bodySize, color: SchoolTheme.textSecondary }}>Teachers</Text>
          </View>
        </View>
      )}
      <Text style={[styles.section, { fontSize: bodySize }]}>Quick access</Text>
      <View style={[styles.grid, columns > 1 && styles.gridMulti]}>
        {QUICK.map((q) => (
          <TouchableOpacity
            key={q.route}
            style={[styles.tile, columns > 1 && styles.tileMulti]}
            onPress={() => router.push(q.route as never)}
          >
            <Text style={styles.tileIcon}>{q.icon}</Text>
            <Text style={[styles.tileLabel, { fontSize: bodySize }]}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
  },
  statN: { fontWeight: "900", color: SchoolTheme.primary },
  section: { fontWeight: "800", color: SchoolTheme.text, marginBottom: 12 },
  grid: { gap: 10 },
  gridMulti: { flexDirection: "row", flexWrap: "wrap" },
  tile: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tileMulti: { flexBasis: "48%", flexGrow: 1 },
  tileIcon: { fontSize: 24 },
  tileLabel: { fontWeight: "700", color: SchoolTheme.text },
});
