import React from "react";
import { View, Text, TouchableOpacity, type DimensionValue } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";

export interface QuickAction {
  title: string;
  icon: AppIconName;
  route: string;
}

export interface QuickActionsGridProps {
  /** List of actions to display */
  actions: QuickAction[];
  /** Column width on mobile (default: "25%") */
  mobileWidth?: DimensionValue;
  /** Column width on desktop (default: "12.5%") */
  desktopWidth?: DimensionValue;
}

/**
 * Reusable quick actions icon grid for dashboards and menus.
 * Renders a responsive grid of tappable icon + label items.
 */
export function QuickActionsGrid({
  actions,
  mobileWidth = "25%" as DimensionValue,
  desktopWidth = "12.5%" as DimensionValue,
}: QuickActionsGridProps) {
  const { isMobile } = useResponsive();

  return (
    <View className="flex-row flex-wrap">
      {actions.map((action, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.75}
          style={{ width: isMobile ? mobileWidth : desktopWidth }}
          className="items-center mb-6"
        >
          <View className="mb-2">
            <IconCircle name={action.icon} size={52} iconSize={24} />
          </View>
          <Text
            className="text-gray-700 font-bold text-[10px] text-center"
            style={{ lineHeight: 13 }}
            numberOfLines={2}
          >
            {action.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
