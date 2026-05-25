import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const PARENT_TABS: TabDef[] = [
  { name: "menu", title: "Menu", icon: "menu", href: "/(parent)/menu" },
  { name: "search", title: "Search", icon: "search", href: "/(parent)/search" },
  { name: "dashboard", title: "Home", icon: "home", href: "/(parent)/dashboard", center: true },
  { name: "timetable", title: "Time Table", icon: "timetable", href: "/(parent)/timetable" },
  { name: "profile", title: "Profile", icon: "profile", href: "/(parent)/profile" },
];

const TAB_ROUTES = ["menu", "search", "dashboard", "timetable", "profile"];

export default function ParentLayout() {
  return (
    <RoleLayoutShell
      tabs={PARENT_TABS}
      tabAccent={SchoolTheme.parent}
      tabRoutes={TAB_ROUTES}
    />
  );
}
