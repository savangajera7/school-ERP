import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { useColorScheme } from "nativewind";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  noAccent?: boolean;
};

export function PremiumCard({ children, style, accentColor, noAccent }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? SchoolTheme.cardDark : "#fff",
          borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6",
        },
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    ...premiumCardShadow,
  },
});
