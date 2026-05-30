import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { AppIcon } from "@/components/icons/AppIcon";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export function PremiumSearchField({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View 
      className="flex-row items-center rounded-2xl border px-4 h-[48px] mb-4"
      style={{ 
        backgroundColor: isDark ? "#1e293b" : "#fff", 
        borderColor: isDark ? "#334155" : "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <AppIcon name="search" size={18} color={isDark ? "#94a3b8" : "#9CA3AF"} />
      <TextInput
        className="flex-1 ml-2 text-[14px] font-bold h-full"
        style={{ color: isDark ? "#f1f5f9" : "#1F2937" } as any}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#64748b" : "#9CA3AF"}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && onClear ? (
        <TouchableOpacity 
          onPress={onClear} 
          activeOpacity={0.7}
          className="w-7 h-7 rounded-lg items-center justify-center bg-slate-700/50"
        >
          <AppIcon name="close" size={14} color="#94a3b8" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// Keep styles object but we are using tailwind classes mostly now
const styles = StyleSheet.create({
  input: {
    paddingVertical: 0,
  },
});
