import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  tabBarPadding?: number;
  style?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function ResponsiveScreen({
  children,
  scroll = true,
  keyboard = false,
  tabBarPadding = 0,
  style,
  edges = ["top", "left", "right"],
}: Props) {
  const insets = useSafeAreaInsets();
  const { padding, maxContentWidth, isWeb } = useResponsive();

  const inner = (
    <View
      style={[
        styles.inner,
        {
          padding,
          paddingBottom: padding + tabBarPadding + insets.bottom,
          maxWidth: maxContentWidth,
          alignSelf: isWeb ? "center" : undefined,
          width: isWeb && maxContentWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {inner}
    </ScrollView>
  ) : (
    inner
  );

  const content = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView style={styles.flex} edges={edges}>
      <StatusBar style="dark" />
      <View style={[styles.flex, { backgroundColor: SchoolTheme.background }]}>
        {content}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { flexGrow: 1 },
});
