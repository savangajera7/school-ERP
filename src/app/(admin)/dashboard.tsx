import React, { useState } from "react";
import {
  View, Text, TouchableOpacity,
  TextInput, RefreshControl, StyleSheet
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { usePermissions } from "@/hooks/usePermissions";
import type { AppRoute } from "@/constants/rolePermissions";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { premiumCardShadow } from "@/constants/premiumStyles";

const QUICK_ACTIONS: {
  title: string;
  icon: AppIconName;
  route: AppRoute;
}[] = [
  { title: "Students", icon: "students", route: "/(admin)/students" as any },
  { title: "Teachers", icon: "teachers", route: "/(admin)/teachers" as any },
  { title: "Parents", icon: "parents", route: "/(admin)/parents" as any },
  { title: "Attendance", icon: "attendance", route: "/(admin)/attendance" as any },
  { title: "Exams", icon: "exams", route: "/(admin)/exams" as any },
  { title: "Fees", icon: "fees", route: "/(admin)/fees" as any },
  { title: "Notices", icon: "notices", route: "/(admin)/notices" as any },
  { title: "Reports", icon: "reports", route: "/(admin)/reports" as any },
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
  const { t } = useTranslation();

  return (
    <PremiumScreenLayout
      title={firstName}
      subtitle="School Control Center"
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      headerSlot={
        /* Search */
        <View className="mb-6 bg-white/10 border border-white/20 rounded-2xl h-[46px] px-4 flex-row items-center gap-2"
              style={{ backgroundColor: "rgba(0,0,0,0.03)", borderColor: "rgba(0,0,0,0.05)" }}>
          <AppIcon name="search" size={18} color="rgba(0,0,0,0.4)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="rgba(0,0,0,0.3)"
            className="flex-1 text-gray-800 text-[13px] font-semibold h-full"
            style={{ outlineWidth: 0 } as any}
          />
        </View>
      }
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
          onPress={() => router.push("/(admin)/students")}
        />
        <StatCard
          isMobile={isMobile}
          icon="teachers"
          label="Total Staff"
          value={isLoading ? "..." : totalStaffVal.toString()}
          sub="Active faculty"
          bg="#F3E8FF"
          textColor="#7E22CE"
          onPress={() => router.push("/(admin)/teachers")}
        />
        <StatCard
          isMobile={isMobile}
          icon="classroom"
          label="Total Classes"
          value={isLoading ? "..." : classCountVal.toString()}
          sub="Grade divisions"
          bg="#FEF3C7"
          textColor="#B45309"
          onPress={() => router.push("/(admin)/masters")}
        />
        <StatCard
          isMobile={isMobile}
          icon="check"
          label="Attendance"
          value={isLoading ? "..." : attendanceTodayVal}
          sub="Today's average"
          bg="#DCFCE7"
          textColor="#15803D"
          onPress={() => router.push("/(admin)/attendance")}
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
    </PremiumScreenLayout>
  );
}

function StatCard({
  isMobile, icon, label, value, sub, bg, textColor, onPress,
}: {
  isMobile: boolean; icon: AppIconName; label: string; value: string;
  sub: string; bg: string; textColor: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        width: isMobile ? "47.5%" : "23.5%",
        ...premiumCardShadow,
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
    </TouchableOpacity>
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
        ...premiumCardShadow,
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
