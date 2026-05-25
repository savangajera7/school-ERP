import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  accentColor?: string;
  iconBackground?: string;
};

export function ActionListRow({
  label,
  icon,
  onPress,
  accentColor = SchoolTheme.primary,
  iconBackground,
}: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <IconCircle
        name={icon}
        size={44}
        iconSize={22}
        color={accentColor}
        backgroundColor={iconBackground ?? `${accentColor}18`}
      />
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.chevron}>
        <AppIcon name="chevronRight" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    minHeight: 56,
  },
  label: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
    fontWeight: "700",
    fontSize: 15,
    color: SchoolTheme.text,
  },
  chevron: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
