import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const PARENT_TABS: TabDef[] = [
  { name: "dashboard", title: "Home", icon: "home", href: "/(parent)/dashboard" },
  { name: "homework", title: "HW", icon: "book", href: "/(parent)/homework" },
  { name: "attendance", title: "Attend", icon: "calendar", href: "/(parent)/attendance" },
  { name: "exam", title: "Exams", icon: "school", href: "/(parent)/exam" },
  { name: "menu", title: "More", icon: "menu", href: "/(parent)/menu" },
];

const TAB_ROUTES = ["dashboard", "homework", "attendance", "exam", "menu"];

export default function ParentLayout() {
  return (
    <RoleLayoutShell
      tabs={PARENT_TABS}
      tabAccent={SchoolTheme.parent}
      tabRoutes={TAB_ROUTES}
    />
  );
}
