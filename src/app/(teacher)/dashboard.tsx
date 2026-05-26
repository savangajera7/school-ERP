import React, { useMemo } from "react";
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
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";
import type { AppIconName } from "@/constants/appIcons";
import type { AppRoute } from "@/constants/rolePermissions";

const QUICK_ACTIONS: {
  title: string;
  icon: AppIconName;
  route: AppRoute;
}[] = [
  { title: "Attendance", icon: "attendance", route: "/(teacher)/attendance" as any },
  { title: "Homework", icon: "homework", route: "/(teacher)/homework" as any },
  { title: "Classwork", icon: "classwork", route: "/(teacher)/classwork" as any },
  { title: "Notebook", icon: "notebook", route: "/(teacher)/notebook" as any },
  { title: "Exam Marks", icon: "exams", route: "/(teacher)/exam-marks" as any },
  { title: "Timetable", icon: "timetable", route: "/(teacher)/timetable" as any },
  { title: "Post Notice", icon: "notices", route: "/(teacher)/notice" as any },
  { title: "Profile", icon: "profile", route: "/(teacher)/profile" as any },
];

export default function TeacherDashboardScreen() {
  const { userData } = useAuthStore();
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
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={loadingClasses} onRefresh={onRefresh} />
      }
    >
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        <StatCard
          isMobile={isMobile}
          icon="academic"
          label="Total Classes"
          value={loadingClasses ? "..." : classCount.toString()}
          sub="Assigned grade rooms"
          bg="#F3E8FF"
          textColor="#7E22CE"
          onPress={() => router.push("/(teacher)/timetable")}
        />
        <StatCard
          isMobile={isMobile}
          icon="subjects"
          label="Active Tasks"
          value="12"
          sub="Assignments pending"
          bg="#FEF3C7"
          textColor="#B45309"
          onPress={() => router.push("/(teacher)/homework")}
        />
        <StatCard
          isMobile={isMobile}
          icon="attendance"
          label="Attendance"
          value="98%"
          sub="Today's submission"
          bg="#DCFCE7"
          textColor="#15803D"
          onPress={() => router.push("/(teacher)/attendance")}
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
      <SectionCard title="Recent Activity" icon="clock">
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
                {i === 0 ? "Marked attendance for Grade 10-A" : 
                 i === 1 ? "Uploaded new Homework for Science" : 
                 "Evaluated Exam Marks for Grade 9"}
              </Text>
            </View>
            <Text className="text-[9px] font-black text-gray-400 uppercase">
              {i === 0 ? "30m ago" : i === 1 ? "2h ago" : "4h ago"}
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
