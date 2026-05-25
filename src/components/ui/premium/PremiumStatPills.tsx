import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type StatPill = {
  label: string;
  value: string;
  bg: string;
  color?: string;
};

type Props = {
  items: StatPill[];
};

export function PremiumStatPills({ items }: Props) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={[styles.pill, { backgroundColor: item.bg }]}>
          <Text style={[styles.value, item.color ? { color: item.color } : null]}>
            {item.value}
          </Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  pill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  value: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 4,
    textTransform: "uppercase",
  },
});
