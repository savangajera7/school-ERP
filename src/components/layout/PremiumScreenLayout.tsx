import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MobileScreenShell } from "@/components/layout/MobileScreenShell";
import { useResponsive } from "@/hooks/useResponsive";
import { OVERLAP_MARGIN } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  hideBack?: boolean;
  rightAction?: React.ReactNode;
  /** Content between header overlap and main body (tabs, filters) */
  headerSlot?: React.ReactNode;
  withTabBar?: boolean;
  scrollable?: boolean;
  keyboard?: boolean;
  bodyStyle?: ViewStyle;
  flatHeader?: boolean;
};

/**
 * Premium stack screen — gradient header + overlapping white content (old app layout).
 */
export function PremiumScreenLayout({
  title,
  subtitle,
  children,
  onBack,
  hideBack = false,
  rightAction,
  headerSlot,
  withTabBar = false,
  scrollable = true,
  keyboard = false,
  bodyStyle,
  flatHeader = false,
}: Props) {
  const { isMobile } = useResponsive();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const body = (
    <View style={[styles.body, bodyStyle]}>
      {headerSlot}
      {children}
    </View>
  );

  const scrollContent = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollGrow}
    >
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        onBack={handleBack}
        hideBack={hideBack}
        rightAction={rightAction}
        flat={flatHeader}
      />
      {body}
    </ScrollView>
  ) : (
    <View style={styles.flex}>
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        onBack={handleBack}
        hideBack={hideBack}
        rightAction={rightAction}
        flat={flatHeader}
      />
      <View style={styles.flex}>{body}</View>
    </View>
  );

  const wrapped = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {scrollContent}
    </KeyboardAvoidingView>
  ) : (
    scrollContent
  );

  return (
    <MobileScreenShell
      withTabBar={withTabBar && isMobile}
      edges={["left", "right"]}
      backgroundColor={SchoolTheme.background}
    >
      <StatusBar style={flatHeader ? "dark" : "light"} translucent backgroundColor="transparent" />
      <View style={styles.flex}>{wrapped}</View>
    </MobileScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: OVERLAP_MARGIN,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
});
