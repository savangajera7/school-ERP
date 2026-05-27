import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";

export interface StatCardProps {
  /** Icon name from AppIcon set */
  icon: AppIconName;
  /** Top label text (e.g. "Total Students") */
  label: string;
  /** Large value display (e.g. "125" or "95%") */
  value: string;
  /** Subtitle below value (e.g. "Active enrollment") */
  subtitle: string;
  /** Background color for the icon circle */
  backgroundColor: string;
  /** Accent color for the value text */
  textColor: string;
  /** Optional press handler */
  onPress?: () => void;
}

/**
 * Reusable stat card for dashboard KPI display.
 * Responsive: 47.5% width on mobile, 23.5% on tablet/desktop.
 */
export function StatCard({
  icon,
  label,
  value,
  subtitle,
  backgroundColor,
  textColor,
  onPress,
}: StatCardProps) {
  const { isMobile } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        width: isMobile ? "47.5%" : "23.5%",
        ...premiumCardShadow,
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <IconCircle
          name={icon}
          size={44}
          backgroundColor={backgroundColor}
          color={textColor}
        />
      </View>
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-0.5">
        {label}
      </Text>
      <Text className="text-2xl font-black" style={{ color: textColor }}>
        {value}
      </Text>
      <Text
        className="text-[11px] font-semibold text-gray-400 mt-1"
        numberOfLines={1}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}
