import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import type { AppIconName } from "@/constants/appIcons";
import { QUICK_ACTION_STYLES } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";

export type QuickActionItem = {
  title: string;
  icon: AppIconName;
  route: string;
};

type Props = {
  items: QuickActionItem[];
  /** Items per row on phone (default 4) */
  mobileColumns?: number;
};

export function QuickActionGrid({ items, mobileColumns = 4 }: Props) {
  const { isMobile, isTablet, isWeb, bodySize } = useResponsive();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const columns = isWeb ? 6 : isTablet ? 5 : mobileColumns;
  const itemWidth = `${100 / columns}%` as const;

  return (
    <View style={styles.wrap}>
      {items.map((action) => {
        const preset = QUICK_ACTION_STYLES[action.icon];
        return (
          <TouchableOpacity
            key={action.route}
            onPress={() => router.push(action.route as never)}
            activeOpacity={0.75}
            style={[styles.cell, { width: itemWidth }]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: preset?.iconBg ?? (isDark ? "#334155" : "#E5E7EB") },
              ]}
            >
              <AppIcon
                name={action.icon}
                size={isMobile ? 24 : 26}
                color={preset?.iconColor ?? SchoolTheme.primary}
                active
              />
            </View>
            <Text
              style={[styles.label, { fontSize: isMobile ? 10 : bodySize, color: isDark ? SchoolTheme.textDark : SchoolTheme.text }]}
              numberOfLines={2}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  cell: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    minHeight: 96,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
    width: "100%",
  },
});
