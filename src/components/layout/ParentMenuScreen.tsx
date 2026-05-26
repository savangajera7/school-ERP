import React from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import type { AppIconName } from "@/constants/appIcons";

const LINKS: { title: string; href: string; icon: AppIconName; desc: string }[] = [
  { title: "Homework", href: "/(parent)/homework", icon: "homework", desc: "View daily student assignments" },
  { title: "Attendance", href: "/(parent)/attendance", icon: "attendance", desc: "Track daily presence records" },
  { title: "Fees & Dues", href: "/(parent)/fees", icon: "fees", desc: "Payment history and pending dues" },
  { title: "Syllabus", href: "/(parent)/syllabus", icon: "syllabus", desc: "Curriculum and course content" },
  { title: "Timetable", href: "/(parent)/timetable", icon: "timetable", desc: "Weekly class schedule" },
  { title: "Exam Marks", href: "/(parent)/exam-marks", icon: "exams", desc: "Subject-wise assessment scores" },
  { title: "Results", href: "/(parent)/result", icon: "results", desc: "Final examination reports" },
  { title: "Notices", href: "/(parent)/notices", icon: "notices", desc: "School announcements and alerts" },
  { title: "Profile", href: "/(parent)/profile", icon: "profile", desc: "Personal information and settings" },
];

export function ParentMenuScreen() {
  return (
    <PremiumScreenLayout
      title="More Options"
      subtitle="Additional parent services"
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
            accentColor="#0369A1"
            onPress={() => router.push(link.href as any)}
          />
        ))}
      </View>
    </PremiumScreenLayout>
  );
}
