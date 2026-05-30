import React from "react";
import { View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import {
  StatCard,
  SectionCard,
  QuickActionsGrid,
  RecentActivityList,
} from "@/components/shared";
import type { QuickAction, ActivityItem } from "@/components/shared";
import type { AppIconName } from "@/constants/appIcons";
import type { AppRoute } from "@/constants/rolePermissions";

const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "Homework", icon: "homework", route: "/(app)/homework" },
  { title: "Attendance", icon: "attendance", route: "/(app)/attendance" },
  { title: "Fees", icon: "fees", route: "/(parent)/fees" },
  { title: "Exams", icon: "exams", route: "/(parent)/exam" },
  { title: "Exam Marks", icon: "exams", route: "/(parent)/result" },
  { title: "Results", icon: "results", route: "/(parent)/result" },
  { title: "Timetable", icon: "timetable", route: "/(admin)/timetable" },
  { title: "Notices", icon: "notices", route: "/(app)/notices" },
  { title: "Syllabus", icon: "syllabus", route: "/(parent)/syllabus" },
  { title: "Profile", icon: "profile", route: "/(app)/profile" },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "Homework assigned: Mathematics", time: "1h ago" },
  { text: "Notice: School Picnic scheduled", time: "3h ago" },
  { text: "Attendance marked for today", time: "5h ago" },
];

export default function ParentDashboardScreen() {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  // Mock loading for now as we don't have hooks yet for parent specific data in this view
  const isLoading = false;
  const onRefresh = () => {};

  return (
    <PremiumScreenLayout
      title=""
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        <StatCard
          icon="attendance"
          label="Attendance Rate"
          value="95%"
          subtitle="Excellent"
          backgroundColor="#E0F2FE"
          textColor="#0369A1"
          onPress={() => router.push("/(app)/attendance")}
        />
        <StatCard
          icon="fees"
          label="Fee Ledger"
          value="Paid"
          subtitle="Status: Up to date"
          backgroundColor="#DCFCE7"
          textColor="#15803D"
          onPress={() => router.push("/(parent)/fees")}
        />
      </View>

      {/* Quick Actions */}
      <SectionCard title={t.quickActions} icon="flash">
        <QuickActionsGrid actions={QUICK_ACTIONS} />
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard title="Recent Updates" icon="clock">
        <RecentActivityList items={RECENT_ACTIVITY} />
      </SectionCard>
    </PremiumScreenLayout>
  );
}
