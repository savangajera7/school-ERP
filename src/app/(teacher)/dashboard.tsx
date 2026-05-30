import React, { useMemo } from "react";
import { View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiClassGetClassList } from "@/api/generated/master-class-medium-shift-1a-2b/master-class-medium-shift-1a-2b";
import { parseApiList } from "@/utils/apiResponse";
import {
  StatCard,
  SectionCard,
  QuickActionsGrid,
  RecentActivityList,
} from "@/components/shared";
import type { QuickAction, ActivityItem } from "@/components/shared";
import type { AppRoute } from "@/constants/rolePermissions";

const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "Attendance", icon: "attendance", route: "/(app)/attendance" as any },
  { title: "Homework", icon: "homework", route: "/(teacher)/homework" as any },
  { title: "Classwork", icon: "classwork", route: "/(teacher)/classwork" as any },
  { title: "Notebook", icon: "notebook", route: "/(teacher)/notebook" as any },
  { title: "Exam Marks", icon: "exams", route: "/(teacher)/exam-marks" as any },
  { title: "Timetable", icon: "timetable", route: "/(admin)/timetable" as any },
  { title: "Post Notice", icon: "notices", route: "/(teacher)/notice" as any },
  { title: "Profile", icon: "profile", route: "/(app)/profile" as any },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "Marked attendance for Grade 10-A", time: "30m ago" },
  { text: "Uploaded new Homework for Science", time: "2h ago" },
  { text: "Evaluated Exam Marks for Grade 9", time: "4h ago" },
];

export default function TeacherDashboardScreen() {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  const { data: classesData, isLoading: loadingClasses, refetch: refetchClasses } = useGetApiClassGetClassList();
  const classes = useMemo(() => parseApiList(classesData?.data), [classesData]);
  const classCount = classes.length;

  const onRefresh = () => {
    refetchClasses();
  };

  return (
    <PremiumScreenLayout
      title=""
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={loadingClasses} onRefresh={onRefresh} />
      }
    >
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        <StatCard
          icon="academic"
          label="Total Classes"
          value={loadingClasses ? "..." : classCount.toString()}
          subtitle="Assigned grade rooms"
          backgroundColor="#F3E8FF"
          textColor="#7E22CE"
          onPress={() => router.push("/(admin)/timetable")}
        />
        <StatCard
          icon="subjects"
          label="Active Tasks"
          value="12"
          subtitle="Assignments pending"
          backgroundColor="#FEF3C7"
          textColor="#B45309"
          onPress={() => router.push("/(teacher)/homework")}
        />
        <StatCard
          icon="attendance"
          label="Attendance"
          value="98%"
          subtitle="Today's submission"
          backgroundColor="#DCFCE7"
          textColor="#15803D"
          onPress={() => router.push("/(app)/attendance")}
        />
      </View>

      {/* Quick Actions */}
      <SectionCard title={t.quickActions} icon="flash">
        <QuickActionsGrid actions={QUICK_ACTIONS} />
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity" icon="clock">
        <RecentActivityList items={RECENT_ACTIVITY} />
      </SectionCard>
    </PremiumScreenLayout>
  );
}
