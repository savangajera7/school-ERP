import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "@/hooks/useTranslation";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  /** Light text on dark backgrounds */
  light?: boolean;
  style?: object;
};

export function PoweredByFooter({ light = false, style }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.text, light && styles.textLight]}>
        {t.poweredBy}{" "}
        <Text style={[styles.brand, light && styles.brandLight]}>{t.mahispark}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 20,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: SchoolTheme.textSecondary,
    letterSpacing: 0.3,
  },
  textLight: {
    color: "rgba(255,255,255,0.65)",
  },
  brand: {
    fontWeight: "900",
    color: SchoolTheme.primary,
  },
  brandLight: {
    color: SchoolTheme.accent,
  },
});
