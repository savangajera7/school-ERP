import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";
import { ActionListRow } from "@/components/dashboard/ActionListRow";
import { Colors } from "@/constants/colors";

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

  return (
    <PremiumScreenLayout
      title={t.portalMenu}
      subtitle={`${roleLabel} · ${t.schoolName}`}
      hideBack={true}
      flatHeader
    >
      <View className="pb-10">
        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          {items.map((item) => (
            <View 
              key={item.route} 
              style={{ width: isMobile ? "100%" : "31.5%" }}
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
    </PremiumScreenLayout>
  );
}
