import type { AppRoute } from "@/constants/rolePermissions";
import type { QuickAction, ActivityItem } from "@/components/shared";
import type { AppIconName } from "@/constants/appIcons";

export const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "User Management", icon: "users", route: "/(super-admin)/users" as any },
  { title: "Role Definitions", icon: "roles", route: "/(super-admin)/roles" as any },
  { title: "Platform Settings", icon: "settings", route: "/(super-admin)/settings" as any },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "New school admin account created", time: "2h ago" },
  { text: "Academic year 2026-27 initialized", time: "5h ago" },
  { text: "System configuration updated", time: "1d ago" },
];

export const getStats = (isLoading: boolean, userCount: number, roleCount: number) => [
  {
    icon: "users" as AppIconName, label: "Total Users", subtitle: "Platform accounts",
    value: isLoading ? "..." : userCount.toString(),
    backgroundColor: "#E0F2FE", textColor: "#0369A1", route: "/(super-admin)/users"
  },
  {
    icon: "roles" as AppIconName, label: "Total Roles", subtitle: "Permission groups",
    value: isLoading ? "..." : roleCount.toString(),
    backgroundColor: "#F3E8FF", textColor: "#7E22CE", route: "/(super-admin)/roles"
  },
  {
    icon: "settings" as AppIconName, label: "System Config", subtitle: "Global parameters",
    value: "Active",
    backgroundColor: "#FEF3C7", textColor: "#B45309", route: "/(super-admin)/settings"
  },
  {
    icon: "check" as AppIconName, label: "System Health", subtitle: "All services active",
    value: "99.9%",
    backgroundColor: "#DCFCE7", textColor: "#15803D"
  }
];
