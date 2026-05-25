import React from "react";
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";

type Props = {
  label: string;
  shortLabel?: string;
  onPress: () => void;
  variant?: "accent" | "ghost";
  style?: ViewStyle;
};

export function HeaderActionButton({
  label,
  shortLabel,
  onPress,
  variant = "accent",
  style,
}: Props) {
  const { isMobile } = useResponsive();
  const text = isMobile && shortLabel ? shortLabel : label;
  const isAccent = variant === "accent";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.base,
        isAccent ? styles.accent : styles.ghost,
        style,
      ]}
    >
      <Text style={[styles.text, isAccent ? styles.textAccent : styles.textGhost]} numberOfLines={1}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accent: {
    backgroundColor: Colors.accent,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  textAccent: { color: "#fff" },
  textGhost: { color: "#fff" },
});
