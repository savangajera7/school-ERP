import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { AppIcon } from "@/components/icons/AppIcon";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";

export default function AdminDashboard() {
  const { isMobile } = useResponsive();

  // API Hooks
  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useGetApiStudentGet();
  const { data: teachersData, isLoading: loadingTeachers, refetch: refetchTeachers } = useGetApiTeacherGetTeacherList();
  const { data: classesData, isLoading: loadingClasses, refetch: refetchClasses } = useGetApiClassGetClassList();

  const studentCount = useMemo(() => parseApiList(studentsData?.data).length, [studentsData]);
  const teacherCount = useMemo(() => parseApiList(teachersData?.data).length, [teachersData]);
  const classCount = useMemo(() => parseApiList(classesData?.data).length, [classesData]);

  const onRefresh = () => {
    refetchStudents();
    refetchTeachers();
    refetchClasses();
  };

  const stats = [
    { label: "Total Students", value: studentCount, icon: "students", color: "#3B82F6", route: "/(admin)/students" },
    { label: "Total Teachers", value: teacherCount, icon: "teacher", color: "#10B981", route: "/(admin)/teachers" },
    { label: "Total Classes", value: classCount, icon: "class", color: "#F59E0B", route: "/(admin)/classes" },
    { label: "Fees Collected", value: "₹2.4M", icon: "money", color: "#6366F1", route: "/(admin)/fees" },
  ];

  const quickActions = [
    { label: "Add Student", icon: "add", route: "/(admin)/students/create" },
    { label: "Mark Attendance", icon: "calendar", route: "/(admin)/attendance" },
    { label: "Send Notice", icon: "compose", route: "/(admin)/notices/create" },
    { label: "View Reports", icon: "search", route: "/(admin)/results" },
  ];

  return (
    <PremiumScreenLayout
      title="School Overview"
      subtitle="Welcome back, Administrator"
      withTabBar
      refreshControl={
        <RefreshControl refreshing={loadingStudents || loadingTeachers || loadingClasses} onRefresh={onRefresh} />
      }
    >
      {/* Stats Grid */}
      <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
        {stats.map((stat, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => router.push(stat.route as any)}
            className={`${isMobile ? "w-full" : "flex-1 min-w-[200px]"}`}
            activeOpacity={0.9}
          >
            <PremiumCard style={{ padding: 20 }}>
              <View className="flex-row items-center gap-4">
                <View 
                  style={{ backgroundColor: `${stat.color}15`, padding: 12, borderRadius: 16 }}
                >
                  <AppIcon name={stat.icon as any} size={24} color={stat.color} active />
                </View>
                <View>
                  <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </Text>
                  <Text className="text-2xl font-black text-gray-900 mt-0.5">
                    {stat.value}
                  </Text>
                </View>
              </View>
            </PremiumCard>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <Text className="text-sm font-black text-gray-900 uppercase tracking-widest mt-8 mb-4 px-1">
        Quick Actions
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {quickActions.map((action, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => router.push(action.route as any)}
            className={`flex-1 min-w-[100px] bg-white border border-gray-150 rounded-2xl p-4 items-center justify-center`}
            style={Platform.OS === 'web' ? { outlineWidth: 0 } as any : {}}
          >
            <View className="bg-gray-50 p-3 rounded-xl mb-2">
              <AppIcon name={action.icon as any} size={20} color={Colors.primary} active />
            </View>
            <Text className="text-[10px] font-black text-gray-800 uppercase text-center">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity Section (Placeholder) */}
      <Text className="text-sm font-black text-gray-900 uppercase tracking-widest mt-8 mb-4 px-1">
        Recent Activity
      </Text>
      <PremiumCard noAccent style={{ padding: 0, overflow: 'hidden' }}>
        {[1, 2, 3].map((_, i) => (
          <View 
            key={i} 
            className={`flex-row items-center justify-between p-4 border-b border-gray-50 ${
              i % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-2 h-2 rounded-full bg-blue-500" />
              <Text className="text-xs font-bold text-gray-700">
                {i === 0 ? "Teacher Ramesh Kumar marked attendance for Class 10A" : 
                 i === 1 ? "New student 'Yash' registered for Grade 1" : 
                 "System backup completed successfully"}
              </Text>
            </View>
            <Text className="text-[10px] font-black text-gray-400 uppercase">
              {i === 0 ? "10m ago" : i === 1 ? "1h ago" : "2h ago"}
            </Text>
          </View>
        ))}
      </PremiumCard>
    </PremiumScreenLayout>
  );
}
