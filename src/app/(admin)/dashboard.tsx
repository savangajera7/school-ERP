import React, { useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Platform, RefreshControl
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { MOBILE_TAB_BAR_HEIGHT } from "@/constants/mobileTabs";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { usePermissions } from "@/hooks/usePermissions";
import type { AppRoute } from "@/constants/rolePermissions";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { AppBrandLogo } from "@/components/branding/AppBrandLogo";
import { useTranslation } from "@/hooks/useTranslation";

const QUICK_ACTIONS: {
  title: string;
  icon: AppIconName;
  route: AppRoute;
}[] = [
  { title: "Students", icon: "students", route: "/(admin)/students" },
  { title: "Teachers", icon: "teachers", route: "/(admin)/teachers" },
  { title: "Parents", icon: "parents", route: "/(admin)/parents" },
  { title: "Attendance", icon: "attendance", route: "/(admin)/attendance/student" },
  { title: "Exams", icon: "exams", route: "/(admin)/exams" },
  { title: "Fees", icon: "fees", route: "/(admin)/fees" },
  { title: "Notices", icon: "notices", route: "/(admin)/notices" },
  { title: "Reports", icon: "reports", route: "/(admin)/results" },
];

export default function AdminDashboard() {
  const { userData } = useAuthStore();
  const { isMobile } = useResponsive();
  const { canAccessRoute } = usePermissions();
  const quickActions = QUICK_ACTIONS.filter((a) => canAccessRoute(a.route));
  const [searchQuery, setSearchQuery] = useState("");

  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useGetApiStudentGet();
  const { data: teachersData, isLoading: loadingTeachers, refetch: refetchTeachers } = useGetApiTeacherGetTeacherList();
  const { data: classesData, isLoading: loadingClasses, refetch: refetchClasses } = useGetApiClassGetClassList();
  const { data: attendanceData, isLoading: loadingAttendance, refetch: refetchAttendance } = useGetApiStudentAttendanceGetStudentAttendanceList();

  const isLoading = loadingStudents || loadingTeachers || loadingClasses || loadingAttendance;

  const onRefresh = () => {
    refetchStudents();
    refetchTeachers();
    refetchClasses();
    refetchAttendance();
  };

  const students = parseApiList(studentsData?.data);
  const teachers = parseApiList(teachersData?.data);
  const classes = parseApiList(classesData?.data);
  const attendance = parseApiList(attendanceData?.data);

  const totalStudentsVal = students.length;
  const totalStaffVal = teachers.length;
  const classCountVal = classes.length;
  
  const presentToday = attendance.filter(
    (a: any) =>
      (a.attendanceStatus || "").toLowerCase() === "present" &&
      String(a.attendanceDate || "").slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;
  
  const attendanceTodayVal =
    attendance.length > 0
      ? `${Math.round((presentToday / attendance.length) * 100)}%`
      : "—";

  const firstName = userData?.name?.split(" ")[0] || "Admin";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right", "bottom"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isMobile ? MOBILE_TAB_BAR_HEIGHT + 32 : 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={["#134A8C", "#0D3666"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingLeft: isMobile ? 16 : 48,
            paddingRight: isMobile ? 16 : 32,
            paddingTop: (insets.top || 0) + (isMobile ? 12 : 20),
            paddingBottom: isMobile ? 60 : 72,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
          }}
        >
          {isMobile ? (
            <DashboardTopBar />
          ) : (
            <View className="mb-5">
              <AppBrandLogo light title={t.schoolName} tagline={t.schoolTagline} />
            </View>
          )}

          {!isMobile && (
            <>
              <Text className="text-white/60 text-xs font-black uppercase tracking-widest">
                {t.welcomeBack}
              </Text>
              <Text className="text-white text-2xl font-black mt-0.5">{firstName}</Text>
            </>
          )}

          {/* Search */}
          <View className="mt-5 bg-white/10 border border-white/20 rounded-2xl h-[46px] px-4 flex-row items-center gap-2">
            <AppIcon name="search" size={18} color="rgba(255,255,255,0.55)" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="flex-1 text-white text-[13px] font-semibold h-full"
              style={{ outlineWidth: 0 } as any}
            />
          </View>
        </LinearGradient>

        <View
          className="px-4 md:pl-12 md:pr-8 max-w-[1200px] w-full self-center"
          style={{ marginTop: -40, position: "relative", zIndex: 10 }}
        >
          {/* Stats Grid */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <StatCard
              isMobile={isMobile}
              icon="students"
              label="Total Students"
              value={isLoading ? "..." : totalStudentsVal.toString()}
              sub="Active enrollment"
              bg="#E0F2FE"
              textColor="#0369A1"
            />
            <StatCard
              isMobile={isMobile}
              icon="teacher"
              label="Total Staff"
              value={isLoading ? "..." : totalStaffVal.toString()}
              sub="Active faculty"
              bg="#F3E8FF"
              textColor="#7E22CE"
            />
            <StatCard
              isMobile={isMobile}
              icon="classroom"
              label="Total Classes"
              value={isLoading ? "..." : classCountVal.toString()}
              sub="Grade divisions"
              bg="#FEF3C7"
              textColor="#B45309"
            />
            <StatCard
              isMobile={isMobile}
              icon="check"
              label="Attendance"
              value={isLoading ? "..." : attendanceTodayVal}
              sub="Today's average"
              bg="#DCFCE7"
              textColor="#15803D"
            />
          </View>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" icon="flash">
            <View className="flex-row flex-wrap">
              {quickActions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.75}
                  style={{ width: isMobile ? "25%" : "12.5%" }}
                  className="items-center mb-6"
                >
                  <View className="mb-2">
                    <IconCircle name={action.icon} size={52} iconSize={24} />
                  </View>
                  <Text
                    className="text-gray-700 font-bold text-[10px] text-center"
                    style={{ lineHeight: 13 }}
                    numberOfLines={2}
                  >
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard title="Recent Activity" icon="clock">
            {[1, 2, 3].map((_, i) => (
              <View 
                key={i} 
                className={`flex-row items-center justify-between py-3 ${
                  i !== 2 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <Text className="text-xs font-bold text-gray-700">
                    {i === 0 ? "New student registered for Grade 1" : 
                     i === 1 ? "Notice published: Annual Sports Day" : 
                     "Staff attendance marked for today"}
                  </Text>
                </View>
                <Text className="text-[9px] font-black text-gray-400 uppercase">
                  {i === 0 ? "10m ago" : i === 1 ? "1h ago" : "2h ago"}
                </Text>
              </View>
            ))}
          </SectionCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  isMobile, icon, label, value, sub, bg, textColor,
}: {
  isMobile: boolean; icon: AppIconName; label: string; value: string;
  sub: string; bg: string; textColor: string;
}) {
  return (
    <View
      className="bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        width: isMobile ? "48%" : "23.5%",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <IconCircle name={icon} size={44} backgroundColor={bg} color={textColor} />
      </View>
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-0.5">
        {label}
      </Text>
      <Text className="text-2xl font-black" style={{ color: textColor }}>
        {value}
      </Text>
      <Text className="text-[11px] font-semibold text-gray-400 mt-1" numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function SectionCard({
  title, icon, children,
}: {
  title: string; icon: AppIconName; children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white border border-gray-100 rounded-2xl mb-4 overflow-hidden"
      style={{
        boxShadow: "0px 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <View className="flex-row items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
        <AppIcon name={icon} size={20} color="#134A8C" active />
        <Text className="text-gray-900 font-black text-[14px] uppercase tracking-wide flex-1">
          {title}
        </Text>
        <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
      </View>
      <View className="p-5">{children}</View>
    </View>
  );
}
