import type { Role } from "@/types/auth.types";
import { MOBILE_TABS_BY_ROLE, type AppRoute } from "@/constants/rolePermissions";

import { PREMIUM_TAB_BAR_HEIGHT } from "@/components/layout/PremiumBottomTabBar";

export const MOBILE_TAB_BAR_HEIGHT = PREMIUM_TAB_BAR_HEIGHT;

export function getMobileTabsForRole(role: Role | null) {
  if (!role) return [];
  return MOBILE_TABS_BY_ROLE[role];
}

/** Routes where the floating bottom tab bar is shown on mobile */
export function isMobileTabRoute(pathname: string, role: Role | null): boolean {
  if (!role) return false;
  const path = pathname.replace(/\/$/, "") || "/";
  const tabs = getMobileTabsForRole(role);

  return tabs.some((tab) => {
    const short = tab.route.replace("/(app)", "");
    if (tab.route === "/(app)/dashboard") {
      return path === tab.route || path === short || path === "/" || path === "/dashboard";
    }
    return path === tab.route || path === short || path.endsWith(short);
  });
}

export type { AppRoute };
