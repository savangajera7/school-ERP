import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  title: string;
  icon?: AppIconName;
  onViewAll?: () => void;
};

export function PremiumSectionBar({ title, icon = "notices", onViewAll }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <IconCircle name={icon} size={36} iconSize={18} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {onViewAll ? (
        <TouchableOpacity style={styles.viewAll} onPress={onViewAll} activeOpacity={0.8}>
          <AppIcon name="expand" size={14} color="#fff" active />
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F0FA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D6E4F5",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: SchoolTheme.primary,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: SchoolTheme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
