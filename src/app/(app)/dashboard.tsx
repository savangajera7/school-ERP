import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Image, Platform
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { MOBILE_TAB_BAR_HEIGHT } from "@/constants/mobileTabs";
import { useDashboardAdmin } from "@/api/generated/erp-dashboard/erp-dashboard";

// Quick action items
const QUICK_ACTIONS = [
  { title: "Students",   icon: "🎓", route: "/(app)/students",          bg: "#E0F2FE", iconBg: "#BAE6FD" },
  { title: "Attendance", icon: "📝", route: "/(app)/attendance",         bg: "#FEF9C3", iconBg: "#FEF08A" },
  { title: "Fees",       icon: "💰", route: "/(app)/fees",               bg: "#DCFCE7", iconBg: "#BBF7D0" },
  { title: "Exams",      icon: "📊", route: "/(app)/exams",              bg: "#F3E8FF", iconBg: "#E9D5FF" },
  { title: "Teachers",   icon: "👥", route: "/(app)/teachers",           bg: "#FFE4E6", iconBg: "#FECDD3" },
  { title: "Notices",    icon: "📢", route: "/(app)/notices",            bg: "#FEF3C7", iconBg: "#FDE68A" },
  { title: "Academic",   icon: "🏫", route: "/(app)/academic-setup",     bg: "#E0E7FF", iconBg: "#C7D2FE" },
  { title: "Inquiries",  icon: "💬", route: "/(app)/inquiries",          bg: "#CFFAFE", iconBg: "#A5F3FC" },
  { title: "Results",    icon: "🏆", route: "/(app)/parent-results",     bg: "#FEF9C3", iconBg: "#FEF08A" },
  { title: "Timetable",  icon: "🗓️", route: "/(app)/timetable",          bg: "#FCE7F3", iconBg: "#FBCFE8" },
  { title: "Reports",    icon: "📈", route: "/(app)/attendance-reports", bg: "#F0FDF4", iconBg: "#BBF7D0" },
  { title: "Admission",  icon: "📋", route: "/(app)/admission-form",     bg: "#F5F3FF", iconBg: "#DDD6FE" },
];

// Sample class attendance status
const CLASS_ATTENDANCE = [
  { name: "Class I – A",   taken: true  },
  { name: "Class I – B",   taken: true  },
  { name: "Class II – A",  taken: false },
  { name: "Class II – B",  taken: false },
  { name: "Class III – A", taken: true  },
];

export default function DashboardScreen() {
  const { userData, logout } = useAuthStore();
  const { isMobile } = useBreakpoint();
  const [searchQuery, setSearchQuery] = useState("");
  const [birthdayTab, setBirthdayTab] = useState<"today" | "upcoming">("today");

  // Call the live API Dashboard hook
  const { data: dashboardData, isLoading } = useDashboardAdmin();

  const stats = (dashboardData?.data as any)?.data || {};
  
  // Safe extraction supporting any backend json naming policies
  const totalStudentsVal = stats.totalStudents ?? stats.TotalStudents ?? 0;
  const attendanceTodayVal = stats.attendanceToday ?? stats.AttendanceToday ?? "94.2%";
  const totalStaffVal = stats.totalStaff ?? stats.TotalStaff ?? 12;
  const staffAttendanceVal = stats.staffAttendance ?? stats.StaffAttendance ?? "100%";

  const firstName = userData?.name?.split(" ")[0] || "Admin";
  const insets = useSafeAreaInsets();

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
          {/* Top bar: logo + school name + year + logout (Mobile only) */}
          {isMobile && (
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-11 h-11 rounded-2xl bg-white border border-white/20 overflow-hidden items-center justify-center p-0.5"
                >
                  <Image
                    source={{ uri: "https://little-angle.mahispark.com/images/logo.png" }}
                    className="w-9 h-9"
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text className="text-white font-black text-[15px] tracking-wide" style={{ fontFamily: "Outfit" }}>
                    Little Angel's
                  </Text>
                  <Text className="text-[#F5921E] text-[10px] font-black uppercase tracking-widest">
                    સાંઈ વિદ્યા મંદિર · ERP
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl">
                  <Text className="text-white text-[11px] font-black">2026–2027</Text>
                </View>
                <TouchableOpacity
                  onPress={logout}
                  className="w-8 h-8 bg-rose-500/20 border border-rose-400/30 rounded-xl items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-sm">🚪</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Greeting */}
          <Text className="text-white/60 text-xs font-black uppercase tracking-widest">
            Welcome back
          </Text>
          <Text className="text-white text-2xl font-black mt-0.5">
            Hello, {firstName} 👋
          </Text>

          {/* Omni Search */}
          <View className="mt-5 bg-white/10 border border-white/20 rounded-2xl h-[46px] px-4 flex-row items-center gap-2">
            <Text className="text-white/50 text-sm">🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search students, fees, notices…"
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
                emoji="🎓"
                label="Total Students"
                value={isLoading ? "..." : totalStudentsVal.toString()}
                sub={isLoading ? "Loading..." : "Total active students enrolled"}
                bg="#E0F2FE"
                textColor="#0369A1"
              />
              <StatCard
                isMobile={isMobile}
                emoji="✅"
                label="Attendance Today"
                value={isLoading ? "..." : attendanceTodayVal.toString()}
                sub={isLoading ? "Loading..." : "Average student daily attendance"}
                bg="#DCFCE7"
                textColor="#15803D"
              />
              <StatCard
                isMobile={isMobile}
                emoji="👥"
                label="Total Staff"
                value={isLoading ? "..." : totalStaffVal.toString()}
                sub={isLoading ? "Loading..." : "Total registered school faculty"}
                bg="#F3E8FF"
                textColor="#7E22CE"
              />
              <StatCard
                isMobile={isMobile}
                emoji="⏱️"
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
                  <Text className="text-xl">📊</Text>
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
                        <Text className="text-base">🎓</Text>
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
                        <Text className="text-base">✅</Text>
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
                        <Text className="text-base">👥</Text>
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
                        <Text className="text-base">⏱️</Text>
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
          <SectionCard title="Quick Actions" icon="⚡">
            <View className="flex-row flex-wrap">
              {QUICK_ACTIONS.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.75}
                  style={{ width: isMobile ? "25%" : "12.5%" }}
                  className="items-center mb-6"
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: action.bg }}
                  >
                    <Text className="text-2xl">{action.icon}</Text>
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
              <SectionCard title="Birthdays" icon="🎂" noPaddingBody>
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
                  <Text className="text-3xl mb-2">🎁</Text>
                  <Text className="text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                    No birthdays {birthdayTab === "today" ? "today" : "this week"}
                  </Text>
                </View>
              </SectionCard>
            </View>

            {/* Attendance Status Widget */}
            <View className="flex-1">
              <SectionCard title="Attendance Status" icon="📊" noPaddingBody>
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
                        {CLASS_ATTENDANCE.map((cls, i) => (
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
                    {CLASS_ATTENDANCE.map((cls, i) => (
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
  isMobile, emoji, label, value, sub, bg, textColor,
}: {
  isMobile: boolean; emoji: string; label: string; value: string;
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
        <View
          className="w-11 h-11 rounded-xl items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Text className="text-xl">{emoji}</Text>
        </View>
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
  title: string; icon: string; children: React.ReactNode; noPaddingBody?: boolean;
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
        <Text className="text-lg">{icon}</Text>
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
