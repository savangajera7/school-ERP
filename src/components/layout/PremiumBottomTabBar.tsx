import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, router } from "expo-router";
import { SchoolTheme } from "@/constants/theme";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";

export type PremiumTab = {
  key: string;
  label: string;
  icon: AppIconName;
  href: string;
  badge?: number;
  /** Marks the elevated center home button */
  center?: boolean;
};

type Props = {
  tabs: PremiumTab[];
  accent?: string;
};

export const PREMIUM_TAB_BAR_HEIGHT = 78;
const CENTER_SIZE = 58;
const CENTER_LIFT = -26;

function isActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  const short = href.replace(/\/\([^)]+\)/, "");
  if (href.includes("dashboard")) {
    return (
      path === href ||
      path.endsWith("/dashboard") ||
      path === "/" ||
      path.endsWith(short)
    );
  }
  return path === href || path.endsWith(short) || path.includes(short);
}

export function PremiumBottomTabBar({ tabs, accent = SchoolTheme.primary }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 10 : 8);
  const centerIndex = tabs.findIndex((t) => t.center);
  const centerIdx = centerIndex >= 0 ? centerIndex : Math.floor(tabs.length / 2);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      <View style={styles.row}>
        {tabs.map((tab, index) => {
          const active = isActive(pathname, tab.href);
          const isCenter = index === centerIdx && tabs.length >= 3;

          if (isCenter) {
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => router.push(tab.href as never)}
                activeOpacity={0.88}
                style={styles.centerTab}
              >
                <View
                  style={[
                    styles.centerBtn,
                    active && { backgroundColor: accent, borderColor: "#fff" },
                  ]}
                >
                  <AppIcon name={tab.icon} size={28} color="#fff" active />
                </View>
                <Text style={[styles.centerLabel, active && { color: accent, fontWeight: "800" }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => router.push(tab.href as never)}
              activeOpacity={0.75}
              style={styles.sideTab}
            >
              <View style={styles.iconSlot}>
                <AppIcon
                  name={tab.icon}
                  size={active ? 26 : 24}
                  color={active ? accent : "#9CA3AF"}
                  active={active}
                />
                {active ? <View style={[styles.activeDot, { backgroundColor: accent }]} /> : null}
                {tab.badge != null && tab.badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.sideLabel, active && { color: accent, fontWeight: "800" }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8ECF1",
    paddingTop: 8,
    paddingHorizontal: 4,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px -6px 24px rgba(15,40,71,0.1)" }
      : {
          shadowColor: "#0F2847",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 16,
        }),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: PREMIUM_TAB_BAR_HEIGHT - 20,
  },
  sideTab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
  },
  iconSlot: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeDot: {
    position: "absolute",
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 2,
  },
  centerTab: {
    flex: 1,
    alignItems: "center",
    marginTop: CENTER_LIFT,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: "#1A1F2E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 8px 20px rgba(26,31,46,0.35)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 10,
        }),
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 6,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SchoolTheme.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
