import React from "react";
import {
  View, Text, TouchableOpacity,
  RefreshControl
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { premiumCardShadow } from "@/constants/premiumStyles";
import type { AppIconName } from "@/constants/appIcons";
import type { AppRoute } from "@/constants/rolePermissions";

const QUICK_ACTIONS: {
  title: string;
  icon: AppIconName;
  route: AppRoute;
}[] = [
  { title: "Homework", icon: "homework", route: "/(parent)/homework" as any },
  { title: "Attendance", icon: "attendance", route: "/(parent)/attendance" as any },
  { title: "Fees", icon: "fees", route: "/(parent)/fees" as any },
  { title: "Exams", icon: "exams", route: "/(parent)/exam" as any },
  { title: "Exam Marks", icon: "exams", route: "/(parent)/exam-marks" as any },
  { title: "Results", icon: "results", route: "/(parent)/result" as any },
  { title: "Timetable", icon: "timetable", route: "/(parent)/timetable" as any },
  { title: "Notices", icon: "notices", route: "/(parent)/notices" as any },
  { title: "Syllabus", icon: "syllabus", route: "/(parent)/syllabus" as any },
  { title: "Profile", icon: "profile", route: "/(parent)/profile" as any },
];

export default function ParentDashboardScreen() {
  const { userData } = useAuthStore();
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  // Mock loading for now as we don't have hooks yet for parent specific data in this view
  const isLoading = false;
  const onRefresh = () => {};

  return (
    <PremiumScreenLayout
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        <StatCard
          isMobile={isMobile}
          icon="attendance"
          label="Attendance Rate"
          value="95%"
          sub="Excellent"
          bg="#E0F2FE"
          textColor="#0369A1"
          onPress={() => router.push("/(parent)/attendance")}
        />
        <StatCard
          isMobile={isMobile}
          icon="fees"
          label="Fee Ledger"
          value="Paid"
          sub="Status: Up to date"
          bg="#DCFCE7"
          textColor="#15803D"
          onPress={() => router.push("/(parent)/fees")}
        />
      </View>

      {/* Quick Actions */}
      <SectionCard title={t.quickActions} icon="flash">
        <View className="flex-row flex-wrap">
          {QUICK_ACTIONS.map((action, i) => (
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

      {/* Recent Activity */}
      <SectionCard title="Recent Updates" icon="clock">
        {[1, 2, 3].map((_, i) => (
          <View 
            key={i} 
            className={`flex-row items-center justify-between py-3 ${
              i !== 2 ? 'border-b border-gray-50' : ''
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <Text className="text-xs font-bold text-gray-700">
                {i === 0 ? "Homework assigned: Mathematics" : 
                 i === 1 ? "Notice: School Picnic scheduled" : 
                 "Attendance marked for today"}
              </Text>
            </View>
            <Text className="text-[9px] font-black text-gray-400 uppercase">
              {i === 0 ? "1h ago" : i === 1 ? "3h ago" : "5h ago"}
            </Text>
          </View>
        ))}
      </SectionCard>
    </PremiumScreenLayout>
  );
}

function StatCard({
  isMobile, icon, label, value, sub, bg, textColor, onPress,
}: {
  isMobile: boolean; icon: AppIconName; label: string; value: string;
  sub: string; bg: string; textColor: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        width: isMobile ? "47.5%" : "23.5%",
        ...premiumCardShadow,
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
    </TouchableOpacity>
  );
}

function SectionCard({
  title, icon, children,
}: {
  title: string; icon: AppIconName; children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white border border-gray-100 rounded-2xl mb-4 overflow-hidden"
      style={{
        ...premiumCardShadow,
      }}
    >
      <View className="flex-row items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
        <AppIcon name={icon} size={20} color="#134A8C" active />
        <Text className="text-gray-900 font-black text-[14px] uppercase tracking-wide flex-1">
          {title}
        </Text>
        <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
      </View>
      <View className="p-5">{children}</View>
    </View>
  );
}
