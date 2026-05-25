import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { IconCircle } from "@/components/icons/AppIcon";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { TabScreenHeader } from "@/components/layout/TabScreenHeader";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";

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
    <TabScreenLayout
      header={
        <TabScreenHeader
          eyebrow={role ? ROLE_LABELS[role] : "Portal"}
          title={t.portalMenu}
          subtitle={`${roleLabel} · ${t.schoolName}`}
          flat
        />
      }
    >
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as never)}
            activeOpacity={0.85}
            style={[styles.tile, isMobile ? styles.tileMobile : styles.tileDesktop]}
          >
            <IconCircle name={item.icon} size={40} iconSize={20} />
            <Text style={styles.tileLabel}>{translateLabel(item.label)}</Text>
            {item.desc ? (
              <Text style={styles.tileDesc} numberOfLines={2}>
                {item.desc}
              </Text>
            ) : null}
            {"badge" in item && typeof item.badge === "number" && item.badge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </TabScreenLayout>
  );
}

const tileShadow =
  Platform.OS === "web"
    ? { boxShadow: "0px 4px 16px rgba(0,0,0,0.06)" }
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      };

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridMobile: {},
  tile: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
    minHeight: 118,
    ...tileShadow,
  },
  tileMobile: { width: "47.5%" },
  tileDesktop: { width: "31%" },
  tileLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginTop: 10,
  },
  tileDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 15,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
});
