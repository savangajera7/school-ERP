import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { useResponsive } from "@/hooks/useResponsive";
import { premiumCardShadow } from "@/constants/premiumStyles";

const LINKS: { title: string; href: string; icon: AppIconName; desc: string; category: string }[] = [
  { title: "Attendance", href: "/(app)/attendance", icon: "attendance", desc: "Mark and manage student attendance", category: "Classroom" },
  { title: "Homework", href: "/(teacher)/homework", icon: "homework", desc: "Assign and review student homework", category: "Classroom" },
  { title: "Classwork", href: "/(teacher)/classwork", icon: "classwork", desc: "Manage daily classroom activities", category: "Classroom" },
  { title: "Notebook", href: "/(teacher)/notebook", icon: "notebook", desc: "Digital student notebooks", category: "Classroom" },
  { title: "Exam Marks", href: "/(teacher)/exam-marks", icon: "exams", desc: "Record assessment and exam scores", category: "Assessment" },
  { title: "Notices", href: "/(teacher)/notice", icon: "notices", desc: "Post class or school announcements", category: "Communication" },
  { title: "Timetable", href: "/(admin)/timetable", icon: "timetable", desc: "Personal teaching schedule", category: "Schedule" },
  { title: "Profile", href: "/(app)/profile", icon: "profile", desc: "Professional profile and settings", category: "Account" },
];

export function TeacherMenuScreen() {
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
      onBack={() => router.back()}
    >
      <View className="pb-20">
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
            <View key={category} className="mb-6">
              <View className="bg-white border border-gray-100 rounded-2xl p-5 overflow-hidden" style={premiumCardShadow}>
                <View className="flex-row items-center gap-2 mb-4">
                  <AppIcon name="menu" size={20} color="#7E22CE" />
                  <Text className="text-gray-900 font-black text-[14px] uppercase tracking-wide flex-1">
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
                        <IconCircle name={link.icon} size={52} iconSize={24} color="#7E22CE" />
                      </View>
                      <Text
                        className="text-gray-700 font-bold text-[10px] text-center"
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
