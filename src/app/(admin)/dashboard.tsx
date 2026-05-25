import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { QuickActionGrid, type QuickActionItem } from "@/components/dashboard/QuickActionGrid";
import { IconCircle } from "@/components/icons/AppIcon";
import { ROLE_LABELS } from "@/constants/rolePermissions";
const QUICK: QuickActionItem[] = [
  { title: "Students", route: "/(admin)/students", icon: "students" },
  { title: "Teachers", route: "/(admin)/teachers", icon: "teachers" },
  { title: "Fees", route: "/(admin)/fees", icon: "fees" },
  { title: "Attendance", route: "/(admin)/attendance", icon: "attendance" },
  { title: "Exams", route: "/(admin)/exams", icon: "exams" },
  { title: "Notices", route: "/(admin)/notices", icon: "notices" },
  { title: "Reports", route: "/(admin)/reports", icon: "reports" },
  { title: "Parents", route: "/(admin)/parents", icon: "parents" },
  { title: "Alerts", route: "/(admin)/notifications", icon: "notifications" },
  { title: "Settings", route: "/(admin)/settings", icon: "settings" },
];

export default function AdminDashboardScreen() {
  const { userData, role } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { isMobile, bodySize, titleSize } = useResponsive();
  const { data: studentsData, isLoading: ls } = useGetApiStudentGet();
  const { data: teachersData, isLoading: lt } = useGetApiTeacherGetTeacherList();
  const students = parseApiList(studentsData);
  const teachers = parseApiList(teachersData);
  const loading = ls || lt;
  const firstName = userData?.name?.split(" ")[0] || "Admin";
  const roleLabel = role ? ROLE_LABELS[role] : "Administrator";
  const tabPad = isMobile ? ROLE_TAB_BAR_HEIGHT + 24 : 32;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabPad }}
      >
        <LinearGradient
          colors={[SchoolTheme.primary, SchoolTheme.primaryDark]}
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              paddingBottom: isMobile ? 56 : 64,
            },
          ]}
        >
          <View style={styles.headerTop}>
            <Image
              source={require("../../../assets/school-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerText}>
              <Text style={styles.schoolName}>Little Angel&apos;s</Text>
              <Text style={styles.roleBadge}>{roleLabel}</Text>
            </View>
          </View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={[styles.userName, { fontSize: titleSize }]}>Hello, {firstName}</Text>
        </LinearGradient>

        <View style={[styles.body, isMobile && { marginTop: -32 }]}>
          {loading ? (
            <SkeletonLoader rows={2} />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <IconCircle name="students" size={40} />
                <Text style={[styles.statNum, { fontSize: titleSize }]}>{students.length}</Text>
                <Text style={[styles.statLabel, { fontSize: bodySize }]}>Students</Text>
              </View>
              <View style={styles.statCard}>
                <IconCircle name="teachers" size={40} />
                <Text style={[styles.statNum, { fontSize: titleSize }]}>{teachers.length}</Text>
                <Text style={[styles.statLabel, { fontSize: bodySize }]}>Teachers</Text>
              </View>
            </View>
          )}

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { fontSize: bodySize + 2 }]}>Quick Actions</Text>
            <QuickActionGrid items={QUICK} mobileColumns={4} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SchoolTheme.background },
  header: {
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  logo: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#fff" },
  headerText: { flex: 1 },
  schoolName: { color: "#fff", fontWeight: "900", fontSize: 16 },
  roleBadge: {
    color: SchoolTheme.accent,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  welcome: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userName: { color: "#fff", fontWeight: "900", marginTop: 4 },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    alignItems: "flex-start",
    gap: 6,
  },
  statNum: { fontWeight: "900", color: SchoolTheme.primary },
  statLabel: { color: SchoolTheme.textSecondary, fontWeight: "600" },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
  },
  sectionTitle: {
    fontWeight: "800",
    color: SchoolTheme.text,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
