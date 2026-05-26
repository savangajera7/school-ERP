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
      className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center"
      style={premiumCardShadow}
    >
      <IconCircle
        name={icon}
        size={48}
        iconSize={24}
        color={accentColor}
        backgroundColor={iconBackground ?? `${accentColor}15`}
      />
      <View className="flex-1 ml-4 mr-2">
        <Text className="text-[16px] font-bold text-gray-800">
          {label}
        </Text>
        {description && (
          <Text className="text-[12px] font-medium text-gray-500 mt-1">
            {description}
          </Text>
        )}
      </View>
      <View className="w-8 items-center justify-center">
        <AppIcon name="chevronRight" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
