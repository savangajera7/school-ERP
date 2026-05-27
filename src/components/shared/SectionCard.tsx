import React from "react";
import { View, Text } from "react-native";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { AppIcon } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";

export interface SectionCardProps {
  /** Section title (e.g. "Quick Actions") */
  title: string;
  /** Icon displayed next to the title */
  icon: AppIconName;
  /** Card body content */
  children: React.ReactNode;
  /** If true, omits horizontal padding on body (useful for tab bars) */
  noPaddingBody?: boolean;
}

/**
 * Reusable section card for dashboard content blocks.
 * Displays a header bar with icon/title/accent stripe and a body area.
 */
export function SectionCard({
  title,
  icon,
  children,
  noPaddingBody = false,
}: SectionCardProps) {
  return (
    <View
      className="bg-white border border-gray-100 rounded-2xl mb-4 overflow-hidden"
      style={{
        ...premiumCardShadow,
      }}
    >
      <View className="flex-row items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
        <AppIcon name={icon} size={20} color="#134A8C" active />
        <Text className="text-gray-900 font-black text-[14px] uppercase tracking-wide flex-1">
          {title}
        </Text>
        <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
      </View>
      <View className={noPaddingBody ? "pt-4" : "p-5"}>{children}</View>
    </View>
  );
}
