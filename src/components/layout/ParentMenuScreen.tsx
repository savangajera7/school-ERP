import React, { useState } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";
import { useResponsive } from "@/hooks/useResponsive";

const LINKS: { title: string; href: string; icon: AppIconName; desc: string; category: string }[] = [
  { title: "Homework", href: "/(parent)/homework", icon: "homework", desc: "View daily student assignments", category: "Academic" },
  { title: "Attendance", href: "/(parent)/attendance", icon: "attendance", desc: "Track daily presence records", category: "Academic" },
  { title: "Syllabus", href: "/(parent)/syllabus", icon: "syllabus", desc: "Curriculum and course content", category: "Academic" },
  { title: "Timetable", href: "/(parent)/timetable", icon: "timetable", desc: "Weekly class schedule", category: "Academic" },
  { title: "Exam Marks", href: "/(parent)/exam-marks", icon: "exams", desc: "Subject-wise assessment scores", category: "Academic" },
  { title: "Results", href: "/(parent)/result", icon: "results", desc: "Final examination reports", category: "Academic" },
  { title: "Fees & Dues", href: "/(parent)/fees", icon: "fees", desc: "Payment history and pending dues", category: "Finance" },
  { title: "Notices", href: "/(parent)/notices", icon: "notices", desc: "School announcements and alerts", category: "Communication" },
  { title: "Profile", href: "/(parent)/profile", icon: "profile", desc: "Personal information and settings", category: "Account" },
];

export function ParentMenuScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");

  // Group items by category
  const groupedLinks = LINKS.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, typeof LINKS>);

  // Filter items based on search query
  const filteredGroups = Object.entries(groupedLinks).reduce((acc, [category, items]) => {
    const filtered = items.filter(item => {
      const title = item.title.toLowerCase();
      const query = searchQuery.toLowerCase();
      return title.includes(query);
    });
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof LINKS>);

  return (
    <PremiumScreenLayout
      title="More Options"
      subtitle="Additional parent services"
      hideBack={false}
      onBack={() => router.back()}
    >
      <View className="pb-10">
        {/* Search Bar */}
        <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center mb-6">
          <AppIcon name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search menu..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-800 text-[15px]"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <AppIcon name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(filteredGroups).map(([category, categoryLinks]) => (
            <View key={category} className="mb-6">
              <Text className="text-[13px] font-bold text-gray-500 uppercase mb-3 ml-1">
                {category}
              </Text>
              <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
                {categoryLinks.map((link) => (
                  <View 
                    key={link.href} 
                    style={{ width: isMobile ? "100%" : "48%" }}
                  >
                    <ActionListRow
                      label={link.title}
                      description={link.desc}
                      icon={link.icon}
                      accentColor="#0369A1"
                      onPress={() => router.push(link.href as any)}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
          
          {Object.keys(filteredGroups).length === 0 && (
            <View className="items-center py-10">
              <AppIcon name="search" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3 text-[15px] font-semibold">
                No results found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </PremiumScreenLayout>
  );
}
