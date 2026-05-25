import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, router } from "expo-router";
import { SchoolTheme } from "@/constants/theme";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";

export type TabDef = {
  name: string;
  title: string;
  icon: AppIconName;
  href: string;
};

type Props = {
  tabs: TabDef[];
  accent?: string;
};

const TAB_HEIGHT = 56;

export function RoleTabBar({ tabs, accent = SchoolTheme.primary }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: TAB_HEIGHT + Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          pathname.endsWith(tab.name) ||
          pathname.includes(`/${tab.name}`);
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.href as never)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                active && { backgroundColor: `${accent}18` },
              ]}
            >
              <AppIcon
                name={tab.icon}
                size={22}
                color={active ? accent : "#9CA3AF"}
                active={active}
              />
            </View>
            <Text
              style={[styles.label, active && { color: accent, fontWeight: "800" }]}
              numberOfLines={1}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const ROLE_TAB_BAR_HEIGHT = TAB_HEIGHT;

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: SchoolTheme.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }
      : { elevation: 12 }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingTop: 6,
  },
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
});
