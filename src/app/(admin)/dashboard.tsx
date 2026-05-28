import React, { useState } from "react";
import { View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiTeacherGetTeacherList } from "@/api/generated/teacher/teacher";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { useGetApiAttendanceGet } from "@/api/generated/9-attendance/9-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { usePermissions } from "@/hooks/usePermissions";
import type { AppRoute } from "@/constants/rolePermissions";
import type { AppIconName } from "@/constants/appIcons";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import {
  StatCard,
  SectionCard,
  QuickActionsGrid,
  RecentActivityList,
  DashboardSearchBar,
} from "@/components/shared";
import { QUICK_ACTIONS, RECENT_ACTIVITY, getAttendanceTodayVal } from "./_dashboardConfig";

export default function AdminDashboard() {
  const { canAccessRoute } = usePermissions();
  const quickActions = QUICK_ACTIONS.filter((a) => canAccessRoute(a.route));
  const { t } = useTranslation();

  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useGetApiStudentGet();
  const { data: teachersData, isLoading: loadingTeachers, refetch: refetchTeachers } = useGetApiTeacherGetTeacherList();
  const { data: classesData, isLoading: loadingClasses, refetch: refetchClasses } = useGetApiClassGetClassList();
  const { data: attendanceData, isLoading: loadingAttendance, refetch: refetchAttendance } = useGetApiAttendanceGet();

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

  const stats = [
    {
      icon: "students" as AppIconName, label: "Total Students", subtitle: "Active enrollment",
      value: isLoading ? "..." : students.length.toString(),
      backgroundColor: "#E0F2FE", textColor: "#0369A1", route: "/(app)/students"
    },
    {
      icon: "teachers" as AppIconName, label: "Total Staff", subtitle: "Active faculty",
      value: isLoading ? "..." : teachers.length.toString(),
      backgroundColor: "#F3E8FF", textColor: "#7E22CE", route: "/(admin)/teachers"
    },
    {
      icon: "classroom" as AppIconName, label: "Total Classes", subtitle: "Grade divisions",
      value: isLoading ? "..." : classes.length.toString(),
      backgroundColor: "#FEF3C7", textColor: "#B45309", route: "/(admin)/masters"
    },
    {
      icon: "check" as AppIconName, label: "Attendance", subtitle: "Today's average",
      value: isLoading ? "..." : getAttendanceTodayVal(attendance),
      backgroundColor: "#DCFCE7", textColor: "#15803D", route: "/(admin)/attendance"
    }
  ];

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
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            backgroundColor={stat.backgroundColor}
            textColor={stat.textColor}
            onPress={() => router.push(stat.route as any)}
          />
        ))}
      </View>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions" icon="flash">
        <QuickActionsGrid actions={quickActions} />
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity" icon="clock">
        <RecentActivityList items={RECENT_ACTIVITY} />
      </SectionCard>
    </PremiumScreenLayout>
  );
}
