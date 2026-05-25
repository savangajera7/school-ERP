import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { IconCircle } from "@/components/icons/AppIcon";
import { premiumCardShadow } from "@/constants/premiumStyles";

export default function MastersMenuScreen() {
  const masterItems = [
    { label: "Academic Year", icon: "academic", route: "/(admin)/masters/academic-year", desc: "School session periods" },
    { label: "Classes", icon: "school", route: "/(admin)/masters/class", desc: "Manage school classes" },
    { label: "Sections", icon: "classroom", route: "/(admin)/masters/section", desc: "Manage class sections" },
    { label: "Subjects", icon: "subjects", route: "/(admin)/masters/subject", desc: "School curriculum subjects" },
    { label: "Batches", icon: "masters", route: "/(admin)/masters/batch", desc: "Student timing batches" },
    { label: "Blood Groups", icon: "warning", route: "/(admin)/masters/blood-group", desc: "Medical data options" },
    { label: "Categories", icon: "classroom", route: "/(admin)/masters/category", desc: "Student admission categories" },
    { label: "Religions", icon: "language", route: "/(admin)/masters/religion", desc: "Demographic data options" },
  ];

  return (
    <PremiumScreenLayout
      title="Master Data"
      subtitle="Configure school-wide parameters"
      hideBack={false}
      onBack={() => router.back()}
      flatHeader
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.grid}>
          {masterItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
              style={[styles.card, premiumCardShadow]}
            >
              <View style={styles.cardHeader}>
                <IconCircle name={item.icon as any} size={44} iconSize={22} />
                <View style={styles.textContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                <IconCircle name="chevronRight" size={32} iconSize={16} backgroundColor="transparent" color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </PremiumScreenLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
  },
  desc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
});
