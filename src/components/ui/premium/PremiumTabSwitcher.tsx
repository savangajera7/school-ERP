import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

type Tab = { key: string; label: string };

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
};

export function PremiumTabSwitcher({ tabs, active, onChange }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.wrap, { backgroundColor: isDark ? SchoolTheme.cardDark : "#fff", borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6" }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.labelActive, { color: isActive ? SchoolTheme.primary : (isDark ? SchoolTheme.textSecondaryDark : "#9CA3AF") }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 14,
    ...premiumCardShadow,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: `${SchoolTheme.primary}12`,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  labelActive: {
    fontWeight: "900",
  },
});
