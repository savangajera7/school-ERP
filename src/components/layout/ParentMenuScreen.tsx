import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { useResponsive } from "@/hooks/useResponsive";
import { premiumCardShadow } from "@/constants/premiumStyles";

const LINKS: { title: string; href: string; icon: AppIconName; desc: string; category: string }[] = [
  { title: "Homework", href: "/(parent)/homework", icon: "homework", desc: "View daily student assignments", category: "Academic" },
  { title: "Attendance", href: "/(parent)/attendance", icon: "attendance", desc: "Track daily presence records", category: "Academic" },
  { title: "Syllabus", href: "/(parent)/syllabus", icon: "syllabus", desc: "Curriculum and course content", category: "Academic" },
  { title: "Timetable", href: "/(admin)/timetable", icon: "timetable", desc: "Weekly class schedule", category: "Academic" },
  { title: "Exam Marks", href: "/(parent)/result", icon: "exams", desc: "Subject-wise assessment scores", category: "Academic" },
  { title: "Results", href: "/(parent)/result", icon: "results", desc: "Final examination reports", category: "Academic" },
  { title: "Fees & Dues", href: "/(parent)/fees", icon: "fees", desc: "Payment history and pending dues", category: "Finance" },
  { title: "Notices", href: "/(parent)/notices", icon: "notices", desc: "School announcements and alerts", category: "Communication" },
  { title: "Profile", href: "/(app)/profile", icon: "profile", desc: "Personal information and settings", category: "Account" },
];

export function ParentMenuScreen() {
  const { isMobile } = useResponsive();

  // Group items by category
  const groupedLinks = LINKS.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, typeof LINKS>);

  return (
    <PremiumScreenLayout
      title=""
      subtitle=""
      showTopBar
      hideBack={false}
    >
      <View className="pb-20">
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
            <View key={category} className="mb-6">
              <View className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 overflow-hidden" style={premiumCardShadow}>
                <View className="flex-row items-center gap-2 mb-4">
                  <AppIcon name="menu" size={20} color="#0369A1" />
                  <Text className="text-gray-900 dark:text-slate-100 font-black text-[14px] uppercase tracking-wide flex-1">
                    {category}
                  </Text>
                  <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
                </View>
                <View className="flex-row flex-wrap">
                  {categoryLinks.map((link) => (
                    <TouchableOpacity
                      key={link.href}
                      onPress={() => router.push(link.href as any)}
                      activeOpacity={0.75}
                      style={{ width: isMobile ? "25%" : "12.5%" }}
                      className="items-center mb-6"
                    >
                      <View className="mb-2">
                        <IconCircle name={link.icon} size={52} iconSize={24} color="#0369A1" />
                      </View>
                      <Text
                        className="text-gray-700 dark:text-slate-300 font-bold text-[10px] text-center"
                        style={{ lineHeight: 13 }}
                        numberOfLines={2}
                      >
                        {link.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </PremiumScreenLayout>
  );
}
