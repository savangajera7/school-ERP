import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/constants/translations";
import {
  PremiumBottomTabBar,
  PREMIUM_TAB_BAR_HEIGHT,
  type PremiumTab,
} from "@/components/layout/PremiumBottomTabBar";
import type { AppIconName } from "@/constants/appIcons";

export type TabDef = {
  name: string;
  title: string;
  icon: AppIconName;
  href: string;
  /** Elevated center home button */
  center?: boolean;
};

type Props = {
  tabs: TabDef[];
  accent?: string;
};

const TITLE_KEYS: Partial<Record<string, TranslationKey>> = {
  Menu: "menu",
  Search: "search",
  Home: "home",
  "Time Table": "timetable",
  Profile: "profile",
};

export function RoleTabBar({ tabs, accent }: Props) {
  const { t } = useTranslation();

  const premiumTabs: PremiumTab[] = tabs.map((tab) => {
    const key = TITLE_KEYS[tab.title];
    const label = key && key in t ? (t[key as keyof typeof t] as string) : tab.title;
    return {
      key: tab.name,
      label,
      icon: tab.icon,
      href: tab.href,
      center: tab.center ?? tab.name === "dashboard",
    };
  });

  return <PremiumBottomTabBar tabs={premiumTabs} accent={accent} />;
}

export const ROLE_TAB_BAR_HEIGHT = PREMIUM_TAB_BAR_HEIGHT;
