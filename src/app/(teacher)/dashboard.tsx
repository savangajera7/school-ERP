import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { useTranslation } from "@/hooks/useTranslation";
import { MobileScreenShell } from "@/components/layout/MobileScreenShell";
import { QuickActionGrid, type QuickActionItem } from "@/components/dashboard/QuickActionGrid";
import { IconCircle } from "@/components/icons/AppIcon";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";

export default function TeacherDashboardScreen() {
  const { userData, role } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { isMobile, bodySize, titleSize } = useResponsive();
  const firstName = userData?.name?.split(" ")[0] || "Teacher";
  const roleLabel = role ? ROLE_LABELS[role] : "Teacher";
  const tabPad = isMobile ? ROLE_TAB_BAR_HEIGHT + 24 : 32;
  const { t } = useTranslation();

  const QUICK: QuickActionItem[] = [
    { title: t.attendance, route: "/(teacher)/attendance", icon: "attendance" },
    { title: t.homework, route: "/(teacher)/homework", icon: "homework" },
    { title: t.classwork, route: "/(teacher)/classwork", icon: "classwork" },
    { title: t.notebook, route: "/(teacher)/notebook", icon: "notebook" },
    { title: t.examMarks, route: "/(teacher)/exam-marks", icon: "exams" },
    { title: t.timetable, route: "/(teacher)/timetable", icon: "timetable" },
    { title: t.postNotice, route: "/(teacher)/notice", icon: "notices" },
    { title: t.profile, route: "/(teacher)/profile", icon: "profile" },
  ];

  const { data: classesData, isLoading: loadingClasses } = useGetApiClassGetClassList();
  const classCount = useMemo(() => parseApiList(classesData?.data).length, [classesData]);

  return (
    <MobileScreenShell withTabBar={isMobile} edges={["left", "right"]} backgroundColor={SchoolTheme.background}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabPad, flexGrow: 1 }}
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
          {isMobile ? (
            <DashboardTopBar notificationsHref="/(teacher)/notice" />
          ) : (
            <>
              <View style={styles.headerTop}>
                <Image
                  source={require("../../../assets/school-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.headerText}>
                  <Text style={styles.schoolName}>
                    {t.schoolName}
                  </Text>
                  <Text style={styles.roleBadge}>{roleLabel}</Text>
                </View>
              </View>
              <Text style={styles.welcome}>{t.welcomeBack}</Text>
              <Text style={[styles.userName, { fontSize: titleSize }]}>Hello, {firstName}</Text>
            </>
          )}
        </LinearGradient>

        <View style={[styles.body, isMobile && { marginTop: -32 }]}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <IconCircle name="academic" size={40} />
              <Text style={[styles.statNum, { fontSize: titleSize }]}>
                {loadingClasses ? "..." : classCount}
              </Text>
              <Text style={[styles.statLabel, { fontSize: bodySize }]}>Classrooms</Text>
            </View>
            <View style={styles.statCard}>
              <IconCircle name="subjects" size={40} />
              <Text style={[styles.statNum, { fontSize: titleSize }]}>Active</Text>
              <Text style={[styles.statLabel, { fontSize: bodySize }]}>Assignments</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { fontSize: bodySize + 2 }]}>{t.quickActions}</Text>
            <QuickActionGrid items={QUICK} mobileColumns={4} />
          </View>
        </View>
      </ScrollView>
    </MobileScreenShell>
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
