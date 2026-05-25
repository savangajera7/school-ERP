import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { premiumCardShadow } from "@/constants/premiumStyles";

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
  return (
    <View style={styles.wrap}>
      <AppIcon name="search" size={18} color="#9CA3AF" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AppIcon name="close" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 14,
    ...premiumCardShadow,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 0,
  },
});
