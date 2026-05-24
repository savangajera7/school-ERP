import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  bg: string;
  text: string;
  desc: string;
}

const MENU_ITEMS: MenuItem[] = [
  { title: "Dashboard",   icon: "🏠", route: "/(app)/dashboard",          bg: "#E0F2FE", text: "#0369A1", desc: "Main control panel" },
  { title: "Students",    icon: "🎓", route: "/(app)/students",           bg: "#FFE4E6", text: "#E11D48", desc: "Student enrollment & records" },
  { title: "Attendance",  icon: "📝", route: "/(app)/attendance",         bg: "#DCFCE7", text: "#15803D", desc: "Daily student register" },
  { title: "Fees",        icon: "💰", route: "/(app)/fees",               bg: "#FEF9C3", text: "#A16207", desc: "Fee accounts & receipts" },
  { title: "Exams",       icon: "📊", route: "/(app)/exams",              bg: "#F3E8FF", text: "#7E22CE", desc: "Results & schedules" },
  { title: "Teachers",    icon: "👥", route: "/(app)/teachers",           bg: "#ECFDF5", text: "#047857", desc: "Staff directory list" },
  { title: "Notices",     icon: "📢", route: "/(app)/notices",            bg: "#FFF7ED", text: "#C2410C", desc: "Announcements & circulars" },
  { title: "Timetable",   icon: "🗓️", route: "/(app)/timetable",          bg: "#F0FDFA", text: "#0F766E", desc: "Daily class schedule" },
  { title: "Inquiries",   icon: "💬", route: "/(app)/inquiries",          bg: "#EFF6FF", text: "#1D4ED8", desc: "Online admission leads" },
  { title: "Reports",     icon: "📈", route: "/(app)/attendance-reports", bg: "#FDF2F8", text: "#BE185D", desc: "Performance & registers" },
  { title: "Academic",    icon: "🏫", route: "/(app)/academic-setup",     bg: "#E8F5E9", text: "#2E7D32", desc: "Setup classes & terms" },
  { title: "Admission",   icon: "📋", route: "/(app)/admission-form",     bg: "#FFFDE7", text: "#F57F17", desc: "New candidate registry" },
];

export default function MenuScreen() {
  const { isMobile } = useBreakpoint();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── Top Blue Banner ────────────────────────────────────── */}
        <LinearGradient
          colors={["#134A8C", "#0D3666"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white/60 text-xs font-black uppercase tracking-widest">
            Main Directory
          </Text>
          <Text className="text-white text-2xl font-black mt-1" style={{ fontFamily: "Outfit" }}>
            School Portal Menu
          </Text>
          <Text className="text-[#F5921E] text-xs font-bold uppercase tracking-wider mt-1">
            Little Angel's · Little Angel's ERP
          </Text>
        </LinearGradient>

        {/* ── Grid Container ─────────────────────────────────────── */}
        <View 
          className="px-4 w-full self-center max-w-[800px]"
          style={{ marginTop: -20, paddingBottom: isMobile ? 120 : 40 }}
        >
          <View className="flex-row flex-wrap gap-3.5 justify-between">
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm items-center justify-center"
                style={{
                  width: isMobile ? "47.5%" : "31.5%",
                  boxShadow: "0px 4px 16px rgba(0,0,0,0.02)",
                }}
                activeOpacity={0.8}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                  style={{ backgroundColor: item.bg }}
                >
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <Text className="text-gray-800 text-sm font-black text-center">
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-[9px] font-bold text-center mt-1" numberOfLines={1}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
