import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const { isMobile } = useBreakpoint();

  const QUICK_ACTIONS = [
    { title: "Students", icon: "🎓", route: "/(app)/students", color: "#4F46E5" },
    { title: "Attendance", icon: "📝", route: "/(app)/attendance", color: "#10B981" },
    { title: "Fees", icon: "💰", route: "/(app)/fees", color: "#F59E0B" },
    { title: "Exams", icon: "📊", route: "/(app)/exams", color: "#EF4444" },
    { title: "Teachers", icon: "👥", route: "/(app)/teachers", color: "#8B5CF6" },
    { title: "Notices", icon: "📢", route: "/(app)/notices", color: "#EC4899" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="light" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top Branding Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          className="px-6 pt-12 pb-24 rounded-b-[40px]"
        >
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center border border-white/30">
                <Image 
                  source={require("../../../assets/school-logo.png")} 
                  className="w-10 h-10" 
                  resizeMode="contain" 
                />
              </View>
              <View>
                <Text className="text-white/60 text-sm font-bold uppercase letter-spacing-1">Welcome back,</Text>
                <Text className="text-white text-xl font-black">{user?.name || "Administrator"}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={logout}
              className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20"
            >
              <Text className="text-lg">🚪</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white/10 p-6 rounded-3xl border border-white/20">
            <Text className="text-white/80 font-bold mb-1">Current Session</Text>
            <Text className="text-white text-2xl font-black">2026-2027 Academic Year</Text>
            <View className="flex-row items-center mt-4 gap-2">
              <View className="bg-accent px-3 py-1 rounded-lg">
                <Text className="text-white text-xs font-black uppercase">Active</Text>
              </View>
              <Text className="text-white/60 text-xs font-bold">Updated 2 mins ago</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View className="px-6 -mt-12 flex-row flex-wrap justify-between">
          <StatCard title="Total Students" value="1,284" icon="👨‍🎓" trend="+12%" />
          <StatCard title="Daily Attendance" value="94.2%" icon="✅" trend="+2.4%" />
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-8">
          <Text className="text-primary text-lg font-black mb-6 uppercase letter-spacing-1">Management Modules</Text>
          <View className="flex-row flex-wrap justify-between">
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
                className="w-[30%] items-center mb-8"
              >
                <View 
                  className="w-16 h-16 rounded-3xl items-center justify-center mb-3 shadow-lg"
                  style={{ backgroundColor: action.color + '15', borderWidth: 1, borderColor: action.color + '30' }}
                >
                  <Text className="text-2xl">{action.icon}</Text>
                </View>
                <Text className="text-primary/70 text-[13px] font-bold text-center">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View className="px-6 mt-4">
          <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-primary text-lg font-black">Recent Activity</Text>
              <TouchableOpacity>
                <Text className="text-accent font-black">View All</Text>
              </TouchableOpacity>
            </View>
            
            <ActivityItem title="New Admission" desc="Yash Patel joined Std 5-B" time="10 mins ago" icon="✨" />
            <ActivityItem title="Fee Payment" desc="Std 10-A Fee Collection complete" time="1 hour ago" icon="💰" />
            <ActivityItem title="Notice Sent" desc="Holiday announced for Diwali" time="3 hours ago" icon="📢" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: string, trend: string }) {
  return (
    <View 
      className="w-[48%] bg-white p-5 rounded-[32px] border border-gray-100 mb-4 shadow-sm"
    >
      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mb-4">
        <Text className="text-lg">{icon}</Text>
      </View>
      <Text className="text-gray-400 text-xs font-bold uppercase mb-1">{title}</Text>
      <Text className="text-primary text-2xl font-black">{value}</Text>
      <Text className="text-emerald-500 text-[11px] font-black mt-1">{trend} from last month</Text>
    </View>
  );
}

function ActivityItem({ title, desc, time, icon }: { title: string, desc: string, time: string, icon: string }) {
  return (
    <View className="flex-row items-center gap-4 mb-6 last:mb-0">
      <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-primary font-black text-[15px]">{title}</Text>
        <Text className="text-gray-400 text-xs font-medium mt-0.5">{desc}</Text>
      </View>
      <Text className="text-gray-300 text-[10px] font-bold">{time}</Text>
    </View>
  );
}
