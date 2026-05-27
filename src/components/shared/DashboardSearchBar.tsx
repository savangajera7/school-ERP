import React from "react";
import { View, TextInput } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";

export interface DashboardSearchBarProps {
  /** Current search value */
  value: string;
  /** Called when text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text (default: "Search...") */
  placeholder?: string;
}

/**
 * Translucent search bar used in dashboard headers.
 * Designed to sit inside PremiumScreenLayout's headerContent slot.
 */
export function DashboardSearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
}: DashboardSearchBarProps) {
  return (
    <View className="mt-4 bg-white/10 border border-white/20 rounded-2xl h-[46px] px-4 flex-row items-center gap-2">
      <AppIcon name="search" size={18} color="rgba(255,255,255,0.6)" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        className="flex-1 text-white text-[13px] font-semibold h-full"
        style={{ outlineWidth: 0 } as any}
      />
    </View>
  );
}
