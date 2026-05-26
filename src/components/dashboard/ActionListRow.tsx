import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { premiumCardShadow } from "@/constants/premiumStyles";

type Props = {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  accentColor?: string;
  iconBackground?: string;
  description?: string;
};

export function ActionListRow({
  label,
  icon,
  onPress,
  accentColor = "#134A8C",
  iconBackground,
  description,
}: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center mb-3"
      style={premiumCardShadow}
    >
      <IconCircle
        name={icon}
        size={44}
        iconSize={22}
        color={accentColor}
        backgroundColor={iconBackground ?? `${accentColor}10`}
      />
      <View className="flex-1 ml-4 mr-2">
        <Text className="text-[15px] font-black text-gray-800">
          {label}
        </Text>
        {description && (
          <Text className="text-[11px] font-semibold text-gray-400 mt-0.5">
            {description}
          </Text>
        )}
      </View>
      <View className="w-8 items-center justify-center">
        <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}
