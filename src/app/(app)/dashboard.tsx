import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const { userData, logout } = useAuthStore();
  const { isMobile } = useBreakpoint();

  const QUICK_ACTIONS = [
    { title: "Students", icon: "🎓", route: "/(app)/students", color: "#4F46E5" },
    { title: "Attendance", icon: "📝", route: "/(app)/attendance", color: "#10B981" },
    { title: "Fees", icon: "💰", route: "/(app)/fees", color: "#F59E0B" },
    { title: "Exams", icon: "📊", route: "/(app)/exams", color: "#EF4444" },
    { title: "Teachers", icon: "👥", route: "/(app)/teachers", color: "#8B5CF6" },
    { title: "Notices", icon: "📢", route: "/(app)/notices", color: "#EC4899" },
    { title: "Academic", icon: "🏫", route: "/(app)/academic-setup", color: "#6366F1" },
    { title: "Reports", icon: "📈", route: "/(app)/reports", color: "#06B6D4" },
    { title: "Settings", icon: "⚙️", route: "/(app)/settings", color: "#64748B" },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar style="light" />
      
      {/* Background Watermark for Web/Large Screens */}
      {!isMobile && (
        <View 
          className="absolute right-[-100] top-[-100] opacity-[0.03]"
          style={{ transform: [{ rotate: '15deg' }] }}
        >
          <Image 
            source={require("../../../assets/school-logo.png")} 
            style={{ width: 600, height: 600 }}
            resizeMode="contain"
          />
        </View>
      )}

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className={`${!isMobile ? 'max-w-[1200px] w-full self-center' : ''}`}>
          
          {/* Header Section */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={`px-6 pt-12 pb-24 ${!isMobile ? 'rounded-b-[60px] mx-4 mt-4' : 'rounded-b-[40px]'}`}
          >
            {/* User Profile Bar */}
            <View className="flex-row justify-between items-center mb-10">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center border border-white/30 backdrop-blur-xl">
                  <Image 
                    source={require("../../../assets/school-logo.png")} 
                    className="w-12 h-12" 
                    resizeMode="contain" 
                  />
                </View>
                <View>
                  <Text className="text-white/60 text-xs font-black uppercase tracking-widest">Administrator</Text>
                  <Text className="text-white text-2xl font-black mt-1">
                    Hello, {userData?.name?.split(' ')[0] || "Admin"} 👋
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center gap-3">
                <TouchableOpacity 
                  className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 backdrop-blur-md"
                >
                  <Text className="text-xl">🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={logout}
                  className="w-12 h-12 bg-rose-500/20 rounded-2xl items-center justify-center border border-rose-500/30 backdrop-blur-md"
                >
                  <Text className="text-xl">🚪</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Session Info Card */}
            <View className="bg-white/10 p-6 rounded-[32px] border border-white/20 backdrop-blur-2xl">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-white/70 font-bold text-xs uppercase tracking-widest mb-2">Current Academic Session</Text>
                  <Text className="text-white text-3xl font-black">2026 - 2027</Text>
                </View>
                <View className="bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-500/30">
                  <Text className="text-emerald-400 text-xs font-black uppercase tracking-tighter">● Active</Text>
                </View>
              </View>
              
              <View className="h-[1px] bg-white/10 my-6" />
              
              <View className="flex-row items-center gap-6">
                <View>
                  <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest">Term</Text>
                  <Text className="text-white font-bold text-sm mt-1">First Semester</Text>
                </View>
                <View className="w-[1px] h-8 bg-white/10" />
                <View>
                  <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest">Last Sync</Text>
                  <Text className="text-white font-bold text-sm mt-1">Just Now</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Main Content Area */}
          <View className="px-6 -mt-10">
            
            {/* Stats Overview */}
            <View className={`flex-row flex-wrap justify-between ${!isMobile ? 'gap-4' : ''}`}>
              <StatCard 
                title="Total Students" 
                value="1,284" 
                icon="👨‍🎓" 
                trend="+12%" 
                color="#4F46E5"
                isMobile={isMobile}
              />
              <StatCard 
                title="Attendance" 
                value="94.2%" 
                icon="✅" 
                trend="+2.4%" 
                color="#10B981"
                isMobile={isMobile}
              />
            </View>

            {/* Modules Section */}
            <View className="mt-12">
              <View className="flex-row justify-between items-center mb-8 px-2">
                <View>
                  <Text className="text-primary text-xl font-black uppercase tracking-widest">Management</Text>
                  <View className="h-1 w-12 bg-accent mt-2 rounded-full" />
                </View>
                <TouchableOpacity>
                  <Text className="text-accent font-black text-sm">Customize</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap">
                {QUICK_ACTIONS.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => router.push(action.route as any)}
                    activeOpacity={0.7}
                    className={`${isMobile ? 'w-1/3' : 'w-1/4'} items-center mb-10`}
                  >
                    <View 
                      className="w-20 h-20 rounded-[28px] items-center justify-center mb-4 shadow-xl shadow-gray-200"
                      style={{ 
                        backgroundColor: 'white',
                        borderWidth: 1, 
                        borderColor: action.color + '20' 
                      }}
                    >
                      <View 
                        className="w-14 h-14 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: action.color + '10' }}
                      >
                        <Text className="text-3xl">{action.icon}</Text>
                      </View>
                    </View>
                    <Text className="text-primary font-black text-xs text-center uppercase tracking-tighter">
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Activities & Schedule Row */}
            <View className={`mt-4 ${!isMobile ? 'flex-row gap-6' : ''}`}>
              {/* Recent Activity */}
              <View className={`bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 ${!isMobile ? 'flex-1' : 'mb-6'}`}>
                <View className="flex-row justify-between items-center mb-8">
                  <Text className="text-primary text-xl font-black uppercase tracking-widest">Activity</Text>
                  <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-xl">
                    <Text className="text-primary/50 font-black text-[10px] uppercase">Filter</Text>
                  </TouchableOpacity>
                </View>
                
                <ActivityItem title="New Admission" desc="Yash Patel joined Std 5-B" time="10m ago" icon="✨" color="#6366F1" />
                <ActivityItem title="Fee Payment" desc="Std 10-A Collection complete" time="1h ago" icon="💰" color="#F59E0B" />
                <ActivityItem title="Notice Sent" desc="Holiday for Diwali Break" time="3h ago" icon="📢" color="#EC4899" />
              </View>

              {/* School Events / Calendar */}
              <View className={`bg-[#0d3666] p-8 rounded-[40px] ${!isMobile ? 'flex-1' : ''}`}>
                <View className="flex-row justify-between items-center mb-8">
                  <Text className="text-white text-xl font-black uppercase tracking-widest">Events</Text>
                  <TouchableOpacity className="bg-white/10 px-4 py-2 rounded-xl">
                    <Text className="text-white/50 font-black text-[10px] uppercase">Calendar</Text>
                  </TouchableOpacity>
                </View>
                
                <EventItem title="Parents Meet" date="25 May" time="09:00 AM" />
                <EventItem title="Science Fair" date="28 May" time="10:30 AM" />
                <EventItem title="Unit Test" date="01 Jun" time="08:00 AM" />
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ title, value, icon, trend, color, isMobile }: { title: string, value: string, icon: string, trend: string, color: string, isMobile: boolean }) {
  return (
    <View 
      className={`${isMobile ? 'w-[48%]' : 'flex-1'} bg-white p-6 rounded-[36px] border border-gray-100 mb-4 shadow-xl shadow-gray-200/50`}
    >
      <View className="flex-row justify-between items-start mb-6">
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: color + '10' }}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>
        <View className="bg-emerald-50 px-2 py-1 rounded-lg">
          <Text className="text-emerald-600 text-[10px] font-black">{trend}</Text>
        </View>
      </View>
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</Text>
      <Text className="text-primary text-3xl font-black">{value}</Text>
    </View>
  );
}

function ActivityItem({ title, desc, time, icon, color }: { title: string, desc: string, time: string, icon: string, color: string }) {
  return (
    <View className="flex-row items-center gap-5 mb-8 last:mb-0">
      <View 
        className="w-14 h-14 rounded-2xl items-center justify-center"
        style={{ backgroundColor: color + '10' }}
      >
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-primary font-black text-[15px]">{title}</Text>
        <Text className="text-gray-400 text-xs font-bold mt-1" numberOfLines={1}>{desc}</Text>
      </View>
      <Text className="text-gray-300 text-[10px] font-black uppercase tracking-widest">{time}</Text>
    </View>
  );
}

function EventItem({ title, date, time }: { title: string, date: string, time: string }) {
  return (
    <View className="flex-row items-center gap-5 mb-8 last:mb-0">
      <View className="bg-white/10 w-14 h-14 rounded-2xl items-center justify-center border border-white/10">
        <Text className="text-white font-black text-xs text-center leading-tight">
          {date.split(' ')[0]}
          {"\n"}
          <Text className="text-[10px] opacity-50 font-medium">{date.split(' ')[1]}</Text>
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-black text-[15px]">{title}</Text>
        <Text className="text-white/40 text-xs font-bold mt-1">{time}</Text>
      </View>
      <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
        <Text className="text-white/30 text-xs">→</Text>
      </View>
    </View>
  );
}
