import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumBottomTabBar, type PremiumTab } from "@/components/layout/PremiumBottomTabBar";

const LABEL_MAP: Record<string, keyof ReturnType<typeof useTranslation>["t"]> = {
  Menu: "menu",
  Search: "search",
  Home: "home",
  Fees: "fees",
  Profile: "profile",
  Class: "attendance",
  Alerts: "notifications",
  Results: "results",
  Notices: "notifications",
  "Time Table": "timetable",
};

export function BottomTabBar() {
  const { mobileTabs, role } = usePermissions();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();

  if (!role || mobileTabs.length === 0) return null;

  const tabs: PremiumTab[] = mobileTabs.map((tab) => {
    const labelKey = LABEL_MAP[tab.label];
    const label = labelKey ? t[labelKey] : tab.label;
    const isCenter = tab.route.includes("dashboard");
    const badge =
      tab.route.includes("notifications") && unreadCount > 0 ? unreadCount : undefined;
    return {
      key: tab.route,
      label,
      icon: tab.icon,
      href: tab.route,
      center: isCenter,
      badge,
    };
  });

  return <PremiumBottomTabBar tabs={tabs} />;
}
