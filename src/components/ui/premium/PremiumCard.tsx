import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  noAccent?: boolean;
};

export function PremiumCard({ children, style, accentColor, noAccent }: Props) {
  return (
    <View
      style={[
        styles.card,
        !noAccent && {
          borderLeftWidth: 4,
          borderLeftColor: accentColor ?? SchoolTheme.primary,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
    marginBottom: 12,
    ...premiumCardShadow,
  },
});
