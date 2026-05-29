import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const ADMIN_TABS: TabDef[] = [
  { name: "menu", title: "Menu", icon: "menu", href: "/(app)/menu" },
  { name: "search", title: "Search", icon: "search", href: "/(admin)/students" },
  { name: "dashboard", title: "Home", icon: "home", href: "/(admin)/dashboard", center: true },
  { name: "timetable", title: "Time Table", icon: "timetable", href: "/(admin)/timetable" },
  { name: "profile", title: "Profile", icon: "profile", href: "/(app)/profile" },
];

const TAB_ROUTES = ["menu", "students", "dashboard", "timetable", "profile"];

export default function AdminLayout() {
  return (
    <RoleLayoutShell
      sidebar="admin"
      tabs={ADMIN_TABS}
      tabAccent={SchoolTheme.primary}
      tabRoutes={TAB_ROUTES}
    />
  );
}
