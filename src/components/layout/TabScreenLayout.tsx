import React from "react";
import { ScrollView, View, StyleSheet, type ViewStyle } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MobileScreenShell } from "@/components/layout/MobileScreenShell";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  /** Gradient header element */
  header: React.ReactNode;
  /** Overlap content (cards) pulled up under header */
  contentStyle?: ViewStyle;
  withTabBar?: boolean;
  statusBar?: "light" | "dark";
};

/**
 * Consistent mobile tab screen: full-height shell, gradient header, overlapping body.
 */
export function TabScreenLayout({
  children,
  header,
  contentStyle,
  withTabBar = true,
  statusBar = "light",
}: Props) {
  const { isMobile } = useResponsive();

  return (
    <MobileScreenShell withTabBar={withTabBar && isMobile} backgroundColor={SchoolTheme.background}>
      <StatusBar style={statusBar} translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {header}
        <View style={[styles.body, contentStyle]}>{children}</View>
      </ScrollView>
    </MobileScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  body: {
    paddingHorizontal: 16,
    marginTop: -28,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
});
