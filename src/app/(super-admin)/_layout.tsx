import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const SUPER_ADMIN_TABS: TabDef[] = [
  { name: "menu", title: "Menu", icon: "menu", href: "/(super-admin)/menu" },
  { name: "users", title: "Users", icon: "users", href: "/(super-admin)/users" },
  { name: "dashboard", title: "Home", icon: "home", href: "/(super-admin)/dashboard", center: true },
  { name: "roles", title: "Roles", icon: "roles", href: "/(super-admin)/roles" },
  { name: "profile", title: "Profile", icon: "profile", href: "/(super-admin)/profile" },
];

const TAB_ROUTES = ["menu", "dashboard", "users", "roles", "profile"];

export default function SuperAdminLayout() {
  return (
    <RoleLayoutShell
      sidebar="super_admin"
      tabs={SUPER_ADMIN_TABS}
      tabAccent={SchoolTheme.accent}
      tabRoutes={TAB_ROUTES}
    />
  );
}
