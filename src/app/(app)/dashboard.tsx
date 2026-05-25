import React, { useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Platform
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { MOBILE_TAB_BAR_HEIGHT } from "@/constants/mobileTabs";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiFeesGetFeesList } from "@/api/generated/fees/fees";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
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
  { title: "Students", icon: "students", route: "/(app)/students" },
  { title: "Attendance", icon: "attendance", route: "/(app)/attendance" },
  { title: "Fees", icon: "fees", route: "/(app)/fees" },
  { title: "Exams", icon: "exams", route: "/(app)/exams" },
  { title: "Teachers", icon: "teachers", route: "/(app)/teachers" },
  { title: "Notices", icon: "notices", route: "/(app)/notices" },
  { title: "Academic", icon: "academic", route: "/(app)/academic-setup" },
  { title: "Inquiries", icon: "inquiries", route: "/(app)/inquiries" },
  { title: "Results", icon: "results", route: "/(app)/parent-results" },
  { title: "Timetable", icon: "timetable", route: "/(app)/timetable" },
  { title: "Reports", icon: "reports", route: "/(app)/attendance-reports" },
  { title: "Admission", icon: "admission", route: "/(app)/admission-form" },
  { title: "Leave", icon: "leave", route: "/(app)/leave" },
  { title: "Alerts", icon: "notifications", route: "/(app)/notifications" },
];

export default function DashboardScreen() {
  const { userData } = useAuthStore();
  const { isMobile } = useBreakpoint();
  const { canAccessRoute, roleLabel, isParent, isTeacher } = usePermissions();
  const quickActions = QUICK_ACTIONS.filter((a) => canAccessRoute(a.route));
  const [searchQuery, setSearchQuery] = useState("");
  const [birthdayTab, setBirthdayTab] = useState<"today" | "upcoming">("today");

  const { data: studentsData, isLoading: loadingStudents } = useGetApiStudentGet();
  const { data: feesData, isLoading: loadingFees } = useGetApiFeesGetFeesList();
  const { data: attendanceData, isLoading: loadingAttendance } =
    useGetApiStudentAttendanceGetStudentAttendanceList();
  const { data: teachersData, isLoading: loadingTeachers } = useGetApiTeacherGetTeacherList();
  const { data: classesData } = useGetApiClassGetClassList();

  const isLoading = loadingStudents || loadingFees || loadingAttendance || loadingTeachers;

  const students = parseApiList(studentsData);
  const fees = parseApiList(feesData);
  const attendance = parseApiList(attendanceData);
  const teachers = parseApiList(teachersData);
  const classes = parseApiList<{ classID?: number; className?: string }>(classesData);

  const classAttendance = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return classes.slice(0, 8).map((c) => {
      const classId = c.classID;
      const taken = attendance.some(
        (a: { classID?: number; attendanceDate?: string }) =>
          a.classID === classId &&
          String(a.attendanceDate ?? "").slice(0, 10) === today
      );
      return { name: c.className ?? `Class ${classId}`, taken };
    });
  }, [classes, attendance]);

  const totalStudentsVal = students.length;
  const presentToday = attendance.filter(
    (a: { attendanceStatus?: string }) =>
      (a.attendanceStatus || "").toLowerCase() === "present"
  ).length;
  const attendanceTodayVal =
    attendance.length > 0
      ? `${Math.round((presentToday / attendance.length) * 100)}%`
      : "—";
  const totalStaffVal = teachers.length;
  const pendingFees = fees.filter(
    (f: { pendingAmount?: number }) => (f.pendingAmount ?? 0) > 0
  ).length;
  const staffAttendanceVal = `${pendingFees} pending fees`;

  const firstName = userData?.name?.split(" ")[0] || "Admin";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right", "bottom"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── Scrollable body wrapping everything ─────────────────── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isMobile ? MOBILE_TAB_BAR_HEIGHT + 32 : 40 }}
      >
        {/* ── Header Gradient ─────────────────────────────────────── */}
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

          {/* Omni Search */}
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
          {/* ── Web Table vs Mobile Cards Operational Layout ─────────────────── */}
          {isMobile ? (
            <View className="flex-row flex-wrap gap-3 mb-6">
              <StatCard
                isMobile={isMobile}
                icon="students"
                label="Total Students"
                value={isLoading ? "..." : totalStudentsVal.toString()}
                sub={isLoading ? "Loading..." : "Total active students enrolled"}
                bg="#E0F2FE"
                textColor="#0369A1"
              />
              <StatCard
                isMobile={isMobile}
                icon="check"
                label="Attendance Today"
                value={isLoading ? "..." : attendanceTodayVal.toString()}
                sub={isLoading ? "Loading..." : "Average student daily attendance"}
                bg="#DCFCE7"
                textColor="#15803D"
              />
              <StatCard
                isMobile={isMobile}
                icon="teachers"
                label="Total Staff"
                value={isLoading ? "..." : totalStaffVal.toString()}
                sub={isLoading ? "Loading..." : "Total registered school faculty"}
                bg="#F3E8FF"
                textColor="#7E22CE"
              />
              <StatCard
                isMobile={isMobile}
                icon="clock"
                label="Staff Attendance"
                value={isLoading ? "..." : staffAttendanceVal.toString()}
                sub={isLoading ? "Loading..." : "Faculty attendance record"}
                bg="#CFFAFE"
                textColor="#0E7490"
              />
            </View>
          ) : (
            <View
              className="bg-white border border-gray-150 rounded-3xl p-6 mb-6 shadow-sm"
              style={{
                boxShadow: "0px 4px 20px rgba(0,0,0,0.03)",
              }}
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
                  <View className="flex-row items-center px-5 py-4 bg-white">
                    <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                      <View className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 items-center justify-center">
                        <AppIcon name="students" size={18} color="#0369A1" />
                      </View>
                      <Text className="text-sm font-extrabold text-gray-800">Total Enrolled Students</Text>
                    </View>
                    <View style={{ flex: 3, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-500 font-semibold text-center">Active student admissions</Text>
                    </View>
                    <View style={{ flex: 1.5, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-lg font-black text-sky-600 text-center">{isLoading ? "..." : totalStudentsVal}</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-400 font-bold text-center">1,500 Max Cap</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "flex-end", justifyContent: "center" }}>
                      <TouchableOpacity 
                        onPress={() => router.push("/(app)/students")}
                        className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-[10px] font-black text-white uppercase">Manage</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row items-center px-5 py-4 bg-gray-50/10">
                    <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                      <View className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center">
                        <AppIcon name="check" size={18} color="#15803D" />
                      </View>
                      <Text className="text-sm font-extrabold text-gray-800">Student Attendance Today</Text>
                    </View>
                    <View style={{ flex: 3, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-500 font-semibold text-center">Daily present percentage</Text>
                    </View>
                    <View style={{ flex: 1.5, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-lg font-black text-emerald-600 text-center">{isLoading ? "..." : attendanceTodayVal}</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-400 font-bold text-center">100% Target</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "flex-end", justifyContent: "center" }}>
                      <TouchableOpacity 
                        onPress={() => router.push("/(app)/attendance")}
                        className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-[10px] font-black text-white uppercase">Registry</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row items-center px-5 py-4 bg-white">
                    <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                      <View className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 items-center justify-center">
                        <AppIcon name="teachers" size={18} color="#7E22CE" />
                      </View>
                      <Text className="text-sm font-extrabold text-gray-800">Total Faculty & Staff</Text>
                    </View>
                    <View style={{ flex: 3, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-500 font-semibold text-center">Registered teachers & staff</Text>
                    </View>
                    <View style={{ flex: 1.5, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-lg font-black text-purple-600 text-center">{isLoading ? "..." : totalStaffVal}</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-400 font-bold text-center">50 Optimal</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "flex-end", justifyContent: "center" }}>
                      <TouchableOpacity 
                        onPress={() => router.push("/(app)/teachers")}
                        className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-[10px] font-black text-white uppercase">Directory</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row items-center px-5 py-4 bg-gray-50/10">
                    <View style={{ flex: 3.5, flexDirection: "row", alignItems: "center" }} className="gap-3">
                      <View className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 items-center justify-center">
                        <AppIcon name="clock" size={18} color="#0E7490" />
                      </View>
                      <Text className="text-sm font-extrabold text-gray-800">Staff Attendance</Text>
                    </View>
                    <View style={{ flex: 3, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-500 font-semibold text-center">Faculty daily register</Text>
                    </View>
                    <View style={{ flex: 1.5, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-lg font-black text-cyan-600 text-center">{isLoading ? "..." : staffAttendanceVal}</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "center", justifyContent: "center" }}>
                      <Text className="text-xs text-gray-400 font-bold text-center">100% Target</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: "flex-end", justifyContent: "center" }}>
                      <TouchableOpacity 
                        onPress={() => router.push("/(app)/attendance-reports")}
                        className="px-3.5 py-1.5 bg-[#134A8C] rounded-xl"
                        activeOpacity={0.8}
                      >
                        <Text className="text-[10px] font-black text-white uppercase">Reports</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ── Quick Actions ─────────────────────────────────────── */}
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

          {/* ── Two side-by-side widgets ─────────────────────────── */}
          <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>

            {/* Birthday Widget */}
            <View className="flex-1">
              <SectionCard title="Birthdays" icon="birthday" noPaddingBody>
                {/* Tab toggle */}
                <View className="flex-row bg-gray-50 border border-gray-150 rounded-xl p-0.5 mx-5 mb-4">
                  {(["today", "upcoming"] as const).map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setBirthdayTab(tab)}
                      activeOpacity={0.8}
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

                {/* Empty state */}
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

            {/* Attendance Status Widget */}
            <View className="flex-1">
              <SectionCard title="Attendance Status" icon="chart" noPaddingBody>
                {!isMobile ? (
                  /* Elegant Desktop Table */
                  <View className="px-5 pb-5">
                    <View className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <View className="flex-row bg-[#F4F8FC] border-b border-gray-100 px-4 py-3">
                        <Text className="flex-[2] font-black text-gray-400 text-[10px] uppercase tracking-wider">Class Name</Text>
                        <Text className="flex-1 font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">Status</Text>
                        <Text className="flex-1 font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">Last Marked</Text>
                        <Text className="flex-1 font-black text-gray-400 text-[10px] uppercase tracking-wider text-right">Action</Text>
                      </View>
                      <View className="divide-y divide-gray-50">
                        {(classAttendance.length ? classAttendance : [{ name: "No classes configured", taken: false }]).map((cls, i) => (
                          <View key={i} className="flex-row items-center px-4 py-3 bg-white">
                            <Text className="flex-[2] text-xs font-bold text-gray-800">{cls.name}</Text>
                            <View className="flex-grow flex-1 items-center justify-center">
                              <View
                                className={`px-2.5 py-0.5 rounded-full border flex-row items-center gap-1.5 ${
                                  cls.taken
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-rose-50 border-rose-200"
                                }`}
                              >
                                <View className={`w-1.5 h-1.5 rounded-full ${cls.taken ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <Text
                                  className={`text-[9px] font-black uppercase tracking-wider ${
                                    cls.taken ? "text-emerald-700" : "text-rose-700"
                                  }`}
                                >
                                  {cls.taken ? "Taken" : "Pending"}
                                </Text>
                              </View>
                            </View>
                            <Text className="flex-1 text-[11px] text-gray-450 font-semibold text-center">
                              {cls.taken ? "Today, 09:30 AM" : "—"}
                            </Text>
                            <View className="flex-grow flex-1 flex-row justify-end">
                              <TouchableOpacity
                                className={`px-3 py-1.5 rounded-xl border ${
                                  cls.taken
                                    ? "bg-gray-50 border-gray-150"
                                    : "bg-[#134A8C] border-[#134A8C]"
                                }`}
                                activeOpacity={0.8}
                                onPress={() => router.push("/(app)/attendance")}
                              >
                                <Text className={`text-[10px] font-black uppercase tracking-wide ${cls.taken ? "text-gray-400" : "text-white"}`}>
                                  {cls.taken ? "View" : "Mark"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  /* Mobile Cards with Left Brand Accent Highlights */
                  <View className="px-5 pb-5 gap-3">
                    {(classAttendance.length ? classAttendance : [{ name: "No classes configured", taken: false }]).map((cls, i) => (
                      <View
                        key={i}
                        className="bg-white border border-gray-100 rounded-2xl p-4 flex-row justify-between items-center shadow-sm"
                        style={{ borderLeftWidth: 4, borderLeftColor: cls.taken ? "#10B981" : "#F5921E" }}
                      >
                        <View className="gap-0.5">
                          <Text className="text-xs font-black text-gray-800">{cls.name}</Text>
                          <Text className="text-[10px] text-gray-400 font-bold">
                            {cls.taken ? "✓ Last marked: 09:30 AM" : "✗ Pending attendance"}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => router.push("/(app)/attendance")}
                          className={`px-3 py-1 rounded-full border ${
                            cls.taken
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-rose-55 border-rose-200"
                          }`}
                        >
                          <Text
                            className={`text-[9px] font-black uppercase tracking-wider ${
                              cls.taken ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {cls.taken ? "✓ Taken" : "✗ Mark"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </SectionCard>
            </View>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

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
  title, icon, children, noPaddingBody = false,
}: {
  title: string; icon: AppIconName; children: React.ReactNode; noPaddingBody?: boolean;
}) {
  return (
    <View
      className="bg-white border border-gray-100 rounded-2xl mb-4 overflow-hidden"
      style={{
        boxShadow: "0px 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* Card header */}
      <View className="flex-row items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
        <AppIcon name={icon} size={20} color="#134A8C" active />
        <Text className="text-gray-900 font-black text-[14px] uppercase tracking-wide flex-1">
          {title}
        </Text>
        <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
      </View>

      {/* Card body */}
      <View className={noPaddingBody ? "pt-4" : "p-5"}>{children}</View>
    </View>
  );
}
