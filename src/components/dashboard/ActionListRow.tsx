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
      className="bg-[#1e293b] border border-slate-700 rounded-3xl p-5 flex-row items-center mb-1"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View className="w-14 h-14 rounded-2xl bg-slate-700 border border-slate-600 items-center justify-center overflow-hidden">
        <AppIcon name={icon} size={28} color={accentColor} />
      </View>
      <View className="flex-1 ml-4 mr-2">
        <Text className="text-[17px] font-black text-white uppercase tracking-tight">
          {label}
        </Text>
        {description && (
          <Text className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
            {description}
          </Text>
        )}
      </View>
      <View className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center">
        <AppIcon name="chevronRight" size={18} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );
}
