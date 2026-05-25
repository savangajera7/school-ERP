import React from "react";
import { View, StyleSheet, useWindowDimensions, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsive } from "@/hooks/useResponsive";
import { PREMIUM_TAB_BAR_HEIGHT } from "@/components/layout/PremiumBottomTabBar";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  /** Add padding for bottom tab bar */
  withTabBar?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  style?: ViewStyle;
  backgroundColor?: string;
};

export function MobileScreenShell({
  children,
  withTabBar = false,
  edges = ["left", "right"],
  style,
  backgroundColor = SchoolTheme.background,
}: Props) {
  const { height } = useWindowDimensions();
  const { isMobile } = useResponsive();
  const tabPad = withTabBar && isMobile ? PREMIUM_TAB_BAR_HEIGHT + 16 : 0;
  const minH = isMobile ? height - tabPad : undefined;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={edges}>
      <View style={[styles.inner, { minHeight: minH, paddingBottom: tabPad }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1, width: "100%" },
});
