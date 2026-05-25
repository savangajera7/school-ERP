import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  accentColor?: string;
};

export function RoleHeader({
  title,
  subtitle,
  onBack,
  right,
  accentColor = SchoolTheme.primary,
}: Props) {
  const { titleSize, bodySize, padding } = useResponsive();

  return (
    <View style={[styles.wrap, { backgroundColor: accentColor, paddingHorizontal: padding }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.titles}>
          <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.sub, { fontSize: bodySize }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ?? <View style={styles.backPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: { width: 48 },
  titles: { flex: 1 },
  title: { color: "#fff", fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: "500" },
});
