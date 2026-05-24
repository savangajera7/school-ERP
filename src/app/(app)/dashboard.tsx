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
import { BottomTabBar } from "@/components/ui/BottomTabBar";

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

  const firstName = userData?.name?.split(" ")[0] || "Admin";
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right", "bottom"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── Scrollable body wrapping everything ─────────────────── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isMobile ? 100 : 40 }}
      >
        {/* ── Header Gradient ─────────────────────────────────────── */}
        <LinearGradient
          colors={["#0d3666", "#0a2a4e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: isMobile ? 16 : 32,
            paddingTop: (insets.top || 0) + (isMobile ? 12 : 20),
            paddingBottom: isMobile ? 60 : 72,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* Top bar: logo + school name + year + logout */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 overflow-hidden items-center justify-center"
              >
                <Image
                  source={require("../../../assets/school-logo.png")}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text className="text-white font-black text-sm tracking-wide">
                  Sai Vidhya Mandir
                </Text>
                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                  School Management ERP
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
          className="px-4 md:px-8 max-w-[1200px] w-full self-center"
          style={{ marginTop: -40, position: "relative", zIndex: 10 }}
        >
          {/* ── 4 Stat Cards ─────────────────────────────────────── */}
          <View className={`flex-row flex-wrap gap-3 mb-6 ${isMobile ? "" : "gap-4"}`}>
            <StatCard
              isMobile={isMobile}
              emoji="🎓"
              label="Total Students"
              value="169"
              sub="New: 56  ·  Old: 113"
              bg="#E0F2FE"
              textColor="#0369A1"
            />
            <StatCard
              isMobile={isMobile}
              emoji="✅"
              label="Attendance Today"
              value="94.2%"
              sub="Present: 159  ·  Absent: 10"
              bg="#DCFCE7"
              textColor="#15803D"
            />
            <StatCard
              isMobile={isMobile}
              emoji="👥"
              label="Total Staff"
              value="12"
              sub="Teaching: 8  ·  Other: 4"
              bg="#F3E8FF"
              textColor="#7E22CE"
            />
            <StatCard
              isMobile={isMobile}
              emoji="⏱️"
              label="Staff Attendance"
              value="100%"
              sub="Present: 12  ·  Absent: 0"
              bg="#CFFAFE"
              textColor="#0E7490"
            />
          </View>

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
                        birthdayTab === tab ? "bg-[#0d3666]" : ""
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
                {/* Legend */}
                <View className="flex-row gap-4 px-5 mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <Text className="text-[10px] font-bold text-gray-500">Taken</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <Text className="text-[10px] font-bold text-gray-500">Not Taken</Text>
                  </View>
                </View>

                {CLASS_ATTENDANCE.map((cls, i) => (
                  <View
                    key={i}
                    className={`flex-row justify-between items-center px-5 py-3 ${
                      i < CLASS_ATTENDANCE.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    <Text className="text-[13px] font-bold text-gray-800">{cls.name}</Text>
                    <View
                      className={`px-3 py-0.5 rounded-full border ${
                        cls.taken
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-rose-50 border-rose-200"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black uppercase ${
                          cls.taken ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {cls.taken ? "✓ Taken" : "✗ Pending"}
                      </Text>
                    </View>
                  </View>
                ))}
              </SectionCard>
            </View>

          </View>

        </View>
      </ScrollView>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────── */}
      {isMobile && <BottomTabBar />}
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
        <View className="w-1 h-4 bg-orange-500 rounded-full" />
      </View>

      {/* Card body */}
      <View className={noPaddingBody ? "pt-4" : "p-5"}>{children}</View>
    </View>
  );
}
