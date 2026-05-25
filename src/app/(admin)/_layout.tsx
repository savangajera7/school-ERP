import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const ADMIN_TABS: TabDef[] = [
  { name: "dashboard", title: "Home", icon: "home", href: "/(admin)/dashboard" },
  { name: "students", title: "Students", icon: "students", href: "/(admin)/students" },
  { name: "teachers", title: "Staff", icon: "teachers", href: "/(admin)/teachers" },
  { name: "notices", title: "Notices", icon: "notices", href: "/(admin)/notices" },
  { name: "settings", title: "Settings", icon: "settings", href: "/(admin)/settings" },
];

const TAB_ROUTES = ["dashboard", "students", "teachers", "notices", "settings"];

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
