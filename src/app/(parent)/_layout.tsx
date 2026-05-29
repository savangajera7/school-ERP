import React from "react";
import { RoleLayoutShell } from "@/components/layout/RoleLayoutShell";
import { SchoolTheme } from "@/constants/theme";
import type { TabDef } from "@/components/layout/RoleTabBar";

const PARENT_TABS: TabDef[] = [
  { name: "menu", title: "Menu", icon: "menu", href: "/(parent)/menu" },
  { name: "notices", title: "Notices", icon: "notices", href: "/(parent)/notices" },
  { name: "dashboard", title: "Home", icon: "home", href: "/(parent)/dashboard", center: true },
  { name: "timetable", title: "Time Table", icon: "timetable", href: "/(admin)/timetable" },
  { name: "profile", title: "Profile", icon: "profile", href: "/(app)/profile" },
];

const TAB_ROUTES = ["menu", "notices", "dashboard", "timetable", "profile"];

export default function ParentLayout() {
  return (
    <RoleLayoutShell
      tabs={PARENT_TABS}
      tabAccent={SchoolTheme.parent}
      tabRoutes={TAB_ROUTES}
    />
  );
}
