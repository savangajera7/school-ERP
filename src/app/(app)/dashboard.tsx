import React, { useMemo, useState } from "react";
import {
  View, Text, TouchableOpacity,
  TextInput, RefreshControl, ScrollView
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { useGetApiTeacherAttendanceGetTeacherAttendanceList } from "@/api/generated/teacher-attendance/teacher-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { usePermissions } from "@/hooks/usePermissions";
import type { AppRoute } from "@/constants/rolePermissions";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { premiumCardShadow } from "@/constants/premiumStyles";
import {
  StatCard,
  SectionCard,
  QuickActionsGrid,
  RecentActivityList,
} from "@/components/shared";
import { 
  QUICK_ACTIONS, 
  RECENT_ACTIVITY, 
  getAttendanceTodayVal, 
  getOperationalIndicators 
} from "./_dashboardConfig";

export default function DashboardScreen() {
  const { userData } = useAuthStore();
  const { isMobile } = useResponsive();
  const { canAccessRoute } = usePermissions();
  const quickActions = QUICK_ACTIONS.filter((a) => canAccessRoute(a.route));
  const [birthdayTab, setBirthdayTab] = useState<"today" | "upcoming">("today");

  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useGetApiStudentGet();
  const { data: teachersData, isLoading: loadingTeachers, refetch: refetchTeachers } = useGetApiTeacherGetTeacherList();
  const { data: attendanceData, isLoading: loadingAttendance, refetch: refetchAttendance } = useGetApiStudentAttendanceGetStudentAttendanceList();
  const { data: staffAttendanceData, isLoading: loadingStaffAttendance, refetch: refetchStaffAttendance } = useGetApiTeacherAttendanceGetTeacherAttendanceList();

  const isLoading = loadingStudents || loadingTeachers || loadingAttendance || loadingStaffAttendance;

  const onRefresh = () => {
    refetchStudents();
    refetchTeachers();
    refetchAttendance();
    refetchStaffAttendance();
  };

  const students = parseApiList(studentsData?.data);
  const teachers = parseApiList(teachersData?.data);
  const attendance = parseApiList(attendanceData?.data);
  const staffAttendance = parseApiList(staffAttendanceData?.data);

  const totalStudentsVal = students.length;
  const totalStaffVal = teachers.length;
  const attendanceTodayVal = getAttendanceTodayVal(attendance);
  const staffAttendanceVal = getAttendanceTodayVal(staffAttendance);

  const { t } = useTranslation();
  
  const indicators = getOperationalIndicators(
    isLoading,
    totalStudentsVal,
    attendanceTodayVal,
    totalStaffVal,
    staffAttendanceVal
  );

  return (
    <PremiumScreenLayout
      title=""
      subtitle=""
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* ── Web Table vs Mobile Cards Operational Layout ─────────────────── */}
      {isMobile ? (
        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard
            icon="students"
            label="Total Students"
            value={isLoading ? "..." : totalStudentsVal.toString()}
            subtitle="Active enrollment"
            backgroundColor="#E0F2FE"
            textColor="#0369A1"
            onPress={() => router.push("/(app)/students")}
          />
          <StatCard
            icon="check"
            label="Attendance Today"
            value={isLoading ? "..." : attendanceTodayVal}
            subtitle="Student average"
            backgroundColor="#DCFCE7"
            textColor="#15803D"
            onPress={() => router.push("/(app)/attendance")}
          />
          <StatCard
            icon="teachers"
            label="Total Staff"
            value={isLoading ? "..." : totalStaffVal.toString()}
            subtitle="Active faculty"
            backgroundColor="#F3E8FF"
            textColor="#7E22CE"
            onPress={() => router.push("/(app)/teachers")}
          />
          <StatCard
            icon="clock"
            label="Staff Attendance"
            value={isLoading ? "..." : staffAttendanceVal}
            subtitle="Faculty registry"
            backgroundColor="#CFFAFE"
            textColor="#0E7490"
            onPress={() => router.push("/(app)/attendance-reports")}
          />
        </View>
      ) : (
        <View
          className="bg-white border border-gray-155 rounded-3xl p-6 mb-6 overflow-hidden"
          style={{ ...premiumCardShadow }}
        >
          <View className="flex-row justify-between items-center mb-5 border-b border-gray-100 pb-3">
            <View className="flex-row items-center gap-2">
              <AppIcon name="chart" size={22} color="#134A8C" />
              <Text className="text-gray-900 font-black text-sm uppercase tracking-wide">
                Live Operational Performance Indicators
              </Text>
            </View>
            <View className="px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <Text className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Real-time Database Sync
              </Text>
            </View>
          </View>

          <View className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row bg-[#F4F8FC] border-b border-gray-100 px-5 py-3">
              <View style={{ flex: 3.5 }}>
                <Text className="font-black text-gray-400 text-[10px] uppercase tracking-wider">Indicator</Text>
              </View>
              <View style={{ flex: 3, alignItems: "center" }}>
                <Text className="font-black text-gray-400 text-[10px] uppercase tracking-wider">Description</Text>
              </View>
              <View style={{ flex: 1.5, alignItems: "center" }}>
                <Text className="font-black text-gray-400 text-[10px] uppercase tracking-wider">Current Value</Text>
              </View>
              <View style={{ flex: 2, alignItems: "center" }}>
                <Text className="font-black text-gray-400 text-[10px] uppercase tracking-wider">Target Cap</Text>
              </View>
              <View style={{ flex: 2, alignItems: "flex-end" }}>
                <Text className="font-black text-gray-400 text-[10px] uppercase tracking-wider">System Action</Text>
              </View>
            </View>
            
            <View className="divide-y divide-gray-50">
              {indicators.map((ind, i) => (
                <View key={i} className={`flex-row items-center px-5 py-4 ${ind.rowBgClass}`}>
                  <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                    <View className={`w-9 h-9 rounded-xl border items-center justify-center ${ind.iconBgClass}`}>
                      <AppIcon name={ind.icon} size={18} color={ind.iconColorHex} />
                    </View>
                    <Text className="text-sm font-extrabold text-gray-800">{ind.title}</Text>
                  </View>
                  <View style={{ flex: 3, alignItems: "center" }}>
                    <Text className="text-xs text-gray-500 font-semibold">{ind.desc}</Text>
                  </View>
                  <View style={{ flex: 1.5, alignItems: "center" }}>
                    <Text className={`text-lg font-black ${ind.valueColorClass}`}>{ind.value}</Text>
                  </View>
                  <View style={{ flex: 2, alignItems: "center" }}>
                    <Text className="text-xs text-gray-400 font-bold">{ind.target}</Text>
                  </View>
                  <View style={{ flex: 2, alignItems: "flex-end" }}>
                    <TouchableOpacity 
                      onPress={() => router.push(ind.route as any)}
                      className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                    >
                      <Text className="text-[10px] font-black text-white uppercase">{ind.btnText}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <SectionCard title="Quick Actions" icon="flash">
        <QuickActionsGrid actions={quickActions} />
      </SectionCard>

      {/* Two side-by-side widgets */}
      <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
        {/* Birthdays */}
        <View className="flex-1">
          <SectionCard title="Birthdays" icon="birthday" noPaddingBody>
            <View className="flex-row bg-gray-50 border border-gray-150 rounded-xl p-0.5 mx-5 mb-4">
              {(["today", "upcoming"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setBirthdayTab(tab)}
                  className={`flex-1 py-2 rounded-xl items-center ${
                    birthdayTab === tab ? "bg-[#134A8C]" : ""
                  }`}
                >
                  <Text
                    className={`text-[11px] font-black uppercase tracking-wide ${
                      birthdayTab === tab ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {tab === "today" ? "Today" : "Upcoming"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="items-center justify-center py-10">
              <View className="mb-2">
                <IconCircle name="gift" size={48} iconSize={24} />
              </View>
              <Text className="text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                No birthdays {birthdayTab === "today" ? "today" : "this week"}
              </Text>
            </View>
          </SectionCard>
        </View>

        {/* Recent System Log */}
        <View className="flex-1">
          <SectionCard title="Recent Activity" icon="clock">
            <RecentActivityList items={RECENT_ACTIVITY} />
          </SectionCard>
        </View>
      </View>
    </PremiumScreenLayout>
  );
}
