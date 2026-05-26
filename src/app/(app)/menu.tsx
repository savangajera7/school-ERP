import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import { Colors } from "@/constants/colors";
import { AppIcon } from "@/components/icons/AppIcon";

export default function MenuScreen() {
  const { isMobile } = useResponsive();
  const { role, roleLabel, navItems } = usePermissions();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const translateLabel = (label: string): string => {
    switch (label) {
      case "Dashboard": return t.dashboard;
      case "Students": return t.students;
      case "Admission": return t.admission;
      case "Attendance": return t.attendance;
      case "Att. Reports": return t.attendanceReports;
      case "Staff Attend.": return t.staffAttend;
      case "Fees": return t.fees;
      case "Accounts": return t.money;
      case "Exams": return t.exams;
      case "Subjects": return t.subjects;
      case "Teachers": return t.teachers;
      case "Parents": return t.parents;
      case "Notices": return t.notices;
      case "Post Notice": return t.postNotice;
      case "Alerts": return t.alerts;
      case "Send Alert": return t.sendAlert;
      case "Leave": return t.leave;
      case "Timetable": return t.timetable;
      case "Inquiries": return t.inquiries;
      case "Reports": return t.reports;
      case "Academic": return t.academic;
      case "Masters": return t.masters;
      case "Users": return t.users;
      case "Roles": return t.roles;
      case "My Results": return t.myResults;
      default: return label;
    }
  };

  const items = navItems.map((item) =>
    item.route === "/(app)/notifications"
      ? { ...item, badge: unreadCount }
      : item
  );

  // Group items into categories
  const groupedItems = {
    main: items.filter(item => 
      ["Dashboard", "Students", "Admission"].includes(item.label)
    ),
    academic: items.filter(item => 
      ["Attendance", "Att. Reports", "Staff Attend.", "Exams", "Subjects", "Timetable"].includes(item.label)
    ),
    people: items.filter(item => 
      ["Teachers", "Parents", "Leave"].includes(item.label)
    ),
    communication: items.filter(item => 
      ["Notices", "Post Notice", "Alerts", "Send Alert"].includes(item.label)
    ),
    finance: items.filter(item => 
      ["Fees", "Accounts"].includes(item.label)
    ),
    administration: items.filter(item => 
      ["Inquiries", "Reports", "Academic", "Masters", "Users", "Roles"].includes(item.label)
    ),
    student: items.filter(item => 
      ["My Results"].includes(item.label)
    ),
  };

  // Filter items based on search query
  const filteredGroups = Object.entries(groupedItems).reduce((acc, [category, items]) => {
    const filtered = items.filter(item => {
      const translatedLabel = translateLabel(item.label).toLowerCase();
      const query = searchQuery.toLowerCase();
      return translatedLabel.includes(query);
    });
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof items>);

  const categoryTitles: Record<string, string> = {
    main: t.dashboard || "Main",
    academic: t.academic || "Academic",
    people: "People",
    communication: "Communication",
    finance: t.fees || "Finance",
    administration: "Administration",
    student: t.myResults || "Student",
  };

  return (
    <PremiumScreenLayout
      title={t.portalMenu}
      subtitle={`${roleLabel} · ${t.schoolName}`}
      hideBack={true}
      flatHeader
    >
      <View className="pb-10">
        {/* Search Bar */}
        <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center mb-6">
          <AppIcon name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t.search || "Search menu..."}
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
          {Object.entries(filteredGroups).map(([category, categoryItems]) => (
            <View key={category} className="mb-6">
              <Text className="text-[13px] font-bold text-gray-500 uppercase mb-3 ml-1">
                {categoryTitles[category]}
              </Text>
              <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
                {categoryItems.map((item) => (
                  <View 
                    key={item.route} 
                    style={{ width: isMobile ? "100%" : "48%" }}
                  >
                    <ActionListRow
                      label={translateLabel(item.label)}
                      description={item.desc}
                      icon={item.icon as any}
                      accentColor={Colors.primary}
                      onPress={() => router.push(item.route as any)}
                    />
                    {/* Optional Badge for notifications */}
                    {"badge" in item && typeof item.badge === "number" && item.badge > 0 && (
                      <View className="absolute top-2 right-2 bg-rose-500 rounded-full min-w-[20px] h-[20px] items-center justify-center px-1.5 border-2 border-white">
                        <Text className="text-white text-[10px] font-black">{item.badge}</Text>
                      </View>
                    )}
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
