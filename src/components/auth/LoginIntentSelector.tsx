import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SchoolTheme } from "@/constants/theme";
import type { LoginIntent } from "@/utils/roleRouting";
import { intentLabel } from "@/utils/roleRouting";

const INTENTS: {
  id: LoginIntent;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { id: "admin", icon: "shield-checkmark", color: SchoolTheme.admin },
  { id: "teacher", icon: "school", color: SchoolTheme.teacher },
  { id: "parent", icon: "people", color: SchoolTheme.parent },
];

type Props = {
  selected: LoginIntent;
  onChange: (intent: LoginIntent) => void;
};

export function LoginIntentSelector({ selected, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Sign in as</Text>
      <View style={styles.row}>
        {INTENTS.map((item) => {
          const active = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[
                styles.chip,
                active && { borderColor: item.color, backgroundColor: `${item.color}12` },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={active ? item.color : SchoolTheme.textSecondary}
              />
              <Text
                style={[styles.chipText, active && { color: item.color, fontWeight: "800" }]}
                numberOfLines={2}
              >
                {intentLabel(item.id)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20, width: "100%" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: SchoolTheme.textSecondary,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: SchoolTheme.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 11,
    textAlign: "center",
    color: SchoolTheme.textSecondary,
    fontWeight: "600",
  },
});
