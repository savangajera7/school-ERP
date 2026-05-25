import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const TEACHER_TABS: TabDef[] = [
  { name: "dashboard", title: "Home", icon: "home", href: "/(teacher)/dashboard" },
  { name: "homework", title: "HW", icon: "book", href: "/(teacher)/homework" },
  { name: "attendance", title: "Attend", icon: "checkbox", href: "/(teacher)/attendance" },
  { name: "notice", title: "Notice", icon: "megaphone", href: "/(teacher)/notice" },
  { name: "menu", title: "More", icon: "menu", href: "/(teacher)/menu" },
];

const TAB_ROUTES = ["dashboard", "homework", "attendance", "notice", "menu"];

export default function TeacherLayout() {
  return (
    <RoleLayoutShell
      tabs={TEACHER_TABS}
      tabAccent={SchoolTheme.teacher}
      tabRoutes={TAB_ROUTES}
    />
  );
}
