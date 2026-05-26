import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import type { AppIconName } from "@/constants/appIcons";

const LINKS: { title: string; href: string; icon: AppIconName; desc: string }[] = [
  { title: "Attendance", href: "/(teacher)/attendance", icon: "attendance", desc: "Mark and manage student attendance" },
  { title: "Homework", href: "/(teacher)/homework", icon: "homework", desc: "Assign and review student homework" },
  { title: "Classwork", href: "/(teacher)/classwork", icon: "classwork", desc: "Manage daily classroom activities" },
  { title: "Notebook", href: "/(teacher)/notebook", icon: "notebook", desc: "Digital student notebooks" },
  { title: "Notices", href: "/(teacher)/notice", icon: "notices", desc: "Post class or school announcements" },
  { title: "Exam Marks", href: "/(teacher)/exam-marks", icon: "exams", desc: "Record assessment and exam scores" },
  { title: "Timetable", href: "/(teacher)/timetable", icon: "timetable", desc: "Personal teaching schedule" },
  { title: "Profile", href: "/(teacher)/profile", icon: "profile", desc: "Professional profile and settings" },
];

export function TeacherMenuScreen() {
  return (
    <PremiumScreenLayout
      title="More Options"
      subtitle="Faculty services & tools"
      hideBack={false}
      onBack={() => router.back()}
    >
      <View className="pb-10">
        {LINKS.map((link) => (
          <ActionListRow
            key={link.href}
            label={link.title}
            description={link.desc}
            icon={link.icon}
            accentColor="#7E22CE"
            onPress={() => router.push(link.href as any)}
          />
        ))}
      </View>
    </PremiumScreenLayout>
  );
}
