import React from "react";
import { View, Text } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";

type Props = {
  icon: AppIconName;
  label: string;
  active?: boolean;
};

export function TabChip({ icon, label, active = false }: Props) {
  return (
    <View className="flex-row items-center gap-1.5">
      <AppIcon name={icon} size={14} color={active ? "#fff" : "#9CA3AF"} active={active} />
      <Text
        className={`text-xs font-black uppercase tracking-wider ${
          active ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
