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

const QUICK_ACTIONS: {
  title: string;
  icon: AppIconName;
  route: AppRoute;
}[] = [
  { title: "Admission", icon: "admission", route: "/(app)/admission-form" as any },
  { title: "Students", icon: "students", route: "/(app)/students" as any },
  { title: "Masters", icon: "masters", route: "/(admin)/masters" as any },
  { title: "Teachers", icon: "teachers", route: "/(admin)/teachers" as any },
  { title: "Parents", icon: "parents", route: "/(admin)/parents" as any },
  { title: "Attendance", icon: "attendance", route: "/(admin)/attendance" as any },
  { title: "Exams", icon: "exams", route: "/(admin)/exams" as any },
  { title: "Fees", icon: "fees", route: "/(admin)/fees" as any },
  { title: "Notices", icon: "notices", route: "/(app)/notices" as any },
  { title: "Reports", icon: "reports", route: "/(app)/attendance-reports" as any },
];

export default function DashboardScreen() {
  const { userData } = useAuthStore();
  const { isMobile } = useResponsive();
  const { canAccessRoute } = usePermissions();
  const quickActions = QUICK_ACTIONS.filter((a) => canAccessRoute(a.route));
  const [searchQuery, setSearchQuery] = useState("");
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
  
  const presentToday = attendance.filter(
    (a: any) =>
      (a.attendanceStatus || "").toLowerCase() === "present" &&
      String(a.attendanceDate || "").slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;
  
  const attendanceTodayVal =
    attendance.length > 0
      ? `${Math.round((presentToday / attendance.length) * 100)}%`
      : "—";

  const staffPresentToday = staffAttendance.filter(
    (a: any) =>
      (a.attendanceStatus || "").toLowerCase() === "present" &&
      String(a.attendanceDate || "").slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;

  const staffAttendanceVal =
    staffAttendance.length > 0
      ? `${Math.round((staffPresentToday / staffAttendance.length) * 100)}%`
      : "—";

  const { t } = useTranslation();

  return (
    <PremiumScreenLayout
      title=""
      subtitle=""
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      headerContent={
        /* Search */
        <View className="mt-4 bg-white/10 border border-white/20 rounded-2xl h-[46px] px-4 flex-row items-center gap-2">
          <AppIcon name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-white text-[13px] font-semibold h-full"
            style={{ outlineWidth: 0 } as any}
          />
        </View>
      }
    >
      {/* ── Web Table vs Mobile Cards Operational Layout ─────────────────── */}
      {isMobile ? (
        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard
            isMobile={isMobile}
            icon="students"
            label="Total Students"
            value={isLoading ? "..." : totalStudentsVal.toString()}
            sub="Active enrollment"
            bg="#E0F2FE"
            textColor="#0369A1"
            onPress={() => router.push("/(app)/students")}
          />
          <StatCard
            isMobile={isMobile}
            icon="check"
            label="Attendance Today"
            value={isLoading ? "..." : attendanceTodayVal}
            sub="Student average"
            bg="#DCFCE7"
            textColor="#15803D"
            onPress={() => router.push("/(app)/attendance")}
          />
          <StatCard
            isMobile={isMobile}
            icon="teachers"
            label="Total Staff"
            value={isLoading ? "..." : totalStaffVal.toString()}
            sub="Active faculty"
            bg="#F3E8FF"
            textColor="#7E22CE"
            onPress={() => router.push("/(app)/teachers")}
          />
          <StatCard
            isMobile={isMobile}
            icon="clock"
            label="Staff Attendance"
            value={isLoading ? "..." : staffAttendanceVal}
            sub="Faculty registry"
            bg="#CFFAFE"
            textColor="#0E7490"
            onPress={() => router.push("/(app)/attendance-reports")}
          />
        </View>
      ) : (
        <View
          className="bg-white border border-gray-150 rounded-3xl p-6 mb-6 overflow-hidden"
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
              {/* Row 1: Students */}
              <View className="flex-row items-center px-5 py-4 bg-white">
                <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                  <View className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 items-center justify-center">
                    <AppIcon name="students" size={18} color="#0369A1" />
                  </View>
                  <Text className="text-sm font-extrabold text-gray-800">Total Enrolled Students</Text>
                </View>
                <View style={{ flex: 3, alignItems: "center" }}>
                  <Text className="text-xs text-gray-500 font-semibold">Active student admissions</Text>
                </View>
                <View style={{ flex: 1.5, alignItems: "center" }}>
                  <Text className="text-lg font-black text-sky-600">{isLoading ? "..." : totalStudentsVal}</Text>
                </View>
                <View style={{ flex: 2, alignItems: "center" }}>
                  <Text className="text-xs text-gray-400 font-bold">1,500 Max Cap</Text>
                </View>
                <View style={{ flex: 2, alignItems: "flex-end" }}>
                  <TouchableOpacity 
                    onPress={() => router.push("/(app)/students")}
                    className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                  >
                    <Text className="text-[10px] font-black text-white uppercase">Manage</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 2: Student Attendance */}
              <View className="flex-row items-center px-5 py-4 bg-gray-50/10">
                <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                  <View className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center">
                    <AppIcon name="check" size={18} color="#15803D" />
                  </View>
                  <Text className="text-sm font-extrabold text-gray-800">Student Attendance Today</Text>
                </View>
                <View style={{ flex: 3, alignItems: "center" }}>
                  <Text className="text-xs text-gray-500 font-semibold">Daily present percentage</Text>
                </View>
                <View style={{ flex: 1.5, alignItems: "center" }}>
                  <Text className="text-lg font-black text-emerald-600">{isLoading ? "..." : attendanceTodayVal}</Text>
                </View>
                <View style={{ flex: 2, alignItems: "center" }}>
                  <Text className="text-xs text-gray-400 font-bold">100% Target</Text>
                </View>
                <View style={{ flex: 2, alignItems: "flex-end" }}>
                  <TouchableOpacity 
                    onPress={() => router.push("/(app)/attendance")}
                    className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                  >
                    <Text className="text-[10px] font-black text-white uppercase">Registry</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 3: Staff */}
              <View className="flex-row items-center px-5 py-4 bg-white">
                <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                  <View className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 items-center justify-center">
                    <AppIcon name="teachers" size={18} color="#7E22CE" />
                  </View>
                  <Text className="text-sm font-extrabold text-gray-800">Total Faculty & Staff</Text>
                </View>
                <View style={{ flex: 3, alignItems: "center" }}>
                  <Text className="text-xs text-gray-500 font-semibold">Registered faculty</Text>
                </View>
                <View style={{ flex: 1.5, alignItems: "center" }}>
                  <Text className="text-lg font-black text-purple-600">{isLoading ? "..." : totalStaffVal}</Text>
                </View>
                <View style={{ flex: 2, alignItems: "center" }}>
                  <Text className="text-xs text-gray-400 font-bold">50 Optimal</Text>
                </View>
                <View style={{ flex: 2, alignItems: "flex-end" }}>
                  <TouchableOpacity 
                    onPress={() => router.push("/(app)/teachers")}
                    className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                  >
                    <Text className="text-[10px] font-black text-white uppercase">Directory</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 4: Staff Attendance */}
              <View className="flex-row items-center px-5 py-4 bg-gray-50/10">
                <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                  <View className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 items-center justify-center">
                    <AppIcon name="clock" size={18} color="#0E7490" />
                  </View>
                  <Text className="text-sm font-extrabold text-gray-800">Staff Attendance</Text>
                </View>
                <View style={{ flex: 3, alignItems: "center" }}>
                  <Text className="text-xs text-gray-500 font-semibold">Faculty daily register</Text>
                </View>
                <View style={{ flex: 1.5, alignItems: "center" }}>
                  <Text className="text-lg font-black text-cyan-600">{isLoading ? "..." : staffAttendanceVal}</Text>
                </View>
                <View style={{ flex: 2, alignItems: "center" }}>
                  <Text className="text-xs text-gray-400 font-bold">100% Target</Text>
                </View>
                <View style={{ flex: 2, alignItems: "flex-end" }}>
                  <TouchableOpacity 
                    onPress={() => router.push("/(app)/attendance-reports")}
                    className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                  >
                    <Text className="text-[10px] font-black text-white uppercase">Reports</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

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
                    {i === 0 ? "New student registered" : 
                     i === 1 ? "Notice published: Sports Day" : 
                     "Staff attendance marked"}
                  </Text>
                </View>
                <Text className="text-[9px] font-black text-gray-400 uppercase">
                  {i === 0 ? "10m ago" : i === 1 ? "1h ago" : "2h ago"}
                </Text>
              </View>
            ))}
          </SectionCard>
        </View>
      </View>
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
  title, icon, children, noPaddingBody = false,
}: {
  title: string; icon: AppIconName; children: React.ReactNode; noPaddingBody?: boolean;
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
      <View className={noPaddingBody ? "pt-4" : "p-5"}>{children}</View>
    </View>
  );
}
