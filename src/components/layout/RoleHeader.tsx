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
  flatHeader?: boolean;
};

export function RoleHeader({
  title,
  subtitle,
  onBack,
  right,
  accentColor = SchoolTheme.primary,
  flatHeader = false,
}: Props) {
  const { titleSize, bodySize, padding, isMobile } = useResponsive();

  if (flatHeader) {
    return (
      <View
        className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex-row justify-between items-center z-10"
        style={{
          paddingHorizontal: padding,
          paddingTop: isMobile ? 54 : 64, // Approximate safe area + padding
          paddingBottom: isMobile ? 14 : 18,
        }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#374151" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text
              className="font-black text-gray-900 dark:text-slate-100"
              style={{ fontSize: titleSize }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-gray-400 dark:text-slate-500 font-semibold mt-0.5"
                style={{ fontSize: bodySize - 2 }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {right && <View className="ml-3">{right}</View>}
      </View>
    );
  }

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
