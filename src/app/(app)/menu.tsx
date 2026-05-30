import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";
import { Colors } from "@/constants/colors";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { premiumCardShadow } from "@/constants/premiumStyles";

export default function MenuScreen() {
  const { isMobile } = useResponsive();
  const { role, roleLabel, navItems } = usePermissions();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();

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
      ["Teachers", "Leave"].includes(item.label)
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
      title=""
      subtitle=""
      showTopBar
      hideBack
    >
      <View className="pb-20">
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <View key={category} className="mb-6">
              <View className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 overflow-hidden" style={premiumCardShadow}>
                <View className="flex-row items-center gap-2 mb-4">
                  <AppIcon name="menu" size={20} color="#134A8C" />
                  <Text className="text-gray-900 dark:text-slate-100 font-black text-[14px] uppercase tracking-wide flex-1">
                    {categoryTitles[category]}
                  </Text>
                  <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
                </View>
                <View className="flex-row flex-wrap">
                  {categoryItems.map((item) => (
                    <TouchableOpacity
                      key={item.route}
                      onPress={() => router.push(item.route as any)}
                      activeOpacity={0.75}
                      style={{ width: isMobile ? "25%" : "12.5%" }}
                      className="items-center mb-6"
                    >
                      <View className="mb-2 relative">
                        <IconCircle name={item.icon as any} size={52} iconSize={24} color={Colors.primary} />
                        {/* Optional Badge for notifications */}
                        {"badge" in item && typeof item.badge === "number" && item.badge > 0 && (
                          <View className="absolute -top-1 -right-1 bg-rose-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{item.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        className="text-gray-700 dark:text-slate-300 font-bold text-[10px] text-center"
                        style={{ lineHeight: 13 }}
                        numberOfLines={2}
                      >
                        {translateLabel(item.label)}
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
