import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { ActionListRow } from "@/components/dashboard/ActionListRow";

export default function MastersMenuScreen() {
  const masterItems = [
    { label: "Academic Year", icon: "academic", route: "/(admin)/masters/academic-year", desc: "School session periods" },
    { label: "Classes", icon: "school", route: "/(admin)/masters/class", desc: "Manage school classes" },
    { label: "Sections", icon: "classroom", route: "/(admin)/masters/section", desc: "Manage class sections" },
    { label: "Subjects", icon: "subjects", route: "/(admin)/masters/subject", desc: "School curriculum subjects" },
    { label: "Mediums", icon: "subjects", route: "/(admin)/masters/mediums", desc: "Gujarati, English, etc." },
    { label: "Batches", icon: "masters", route: "/(admin)/masters/batch", desc: "Student timing batches" },
    { label: "Blood Groups", icon: "warning", route: "/(admin)/masters/blood-group", desc: "Medical data options" },
    { label: "Categories", icon: "classroom", route: "/(admin)/masters/category", desc: "Student admission categories" },
    { label: "Religions", icon: "language", route: "/(admin)/masters/religion", desc: "Demographic data options" },
  ];

  return (
    <PremiumScreenLayout
      title="Master Data"
      subtitle="Configure school-wide parameters"
      hideBack={Platform.OS === 'web'}
      onBack={() => router.back()}
      fullWidth
      bodyStyle={{ marginTop: 12 }}
    >
      <View className="pb-10 gap-3">
        {masterItems.map((item) => (
          <ActionListRow
            key={item.route}
            label={item.label}
            description={item.desc}
            icon={item.icon as any}
            accentColor="#B45309"
            onPress={() => router.push(item.route as any)}
          />
        ))}
      </View>
    </PremiumScreenLayout>
  );
}
