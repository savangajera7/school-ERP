import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: string;
  highlight?: boolean;
};

export function PremiumDetailRow({ label, value, highlight }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]} numberOfLines={2}>
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    textAlign: "right",
    flex: 1.2,
    marginLeft: 12,
  },
  valueHighlight: {
    color: "#134A8C",
  },
});
