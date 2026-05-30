import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

interface DataField {
  label: string;
  value: string | React.ReactNode;
  /** Highlight color for value text */
  highlight?: "primary" | "accent" | "success" | "error" | "muted";
}

interface MobileDataCardProps {
  /** Primary title line */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Left icon/avatar */
  icon?: React.ReactNode;
  /** Badge in top-right corner */
  badge?: React.ReactNode;
  /** Key-value data rows */
  fields?: DataField[];
  /** Action buttons at bottom */
  actions?: React.ReactNode;
  /** On card press */
  onPress?: () => void;
  /** Left accent stripe color (defaults to brand primary) */
  accentColor?: string;
  /** Hide the left accent stripe */
  noAccent?: boolean;
}

const highlightColors = {
  primary: `text-[#134A8C]`,
  accent: `text-[#F5921E]`,
  success: "text-emerald-600",
  error: "text-red-600",
  muted: "text-gray-500 dark:text-slate-400",
};

export function MobileDataCard({
  title,
  subtitle,
  icon,
  badge,
  fields,
  actions,
  onPress,
  accentColor,
  noAccent = false,
}: MobileDataCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="bg-[#1e293b] rounded-2xl mb-3 overflow-hidden border border-slate-700"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Top Body Area */}
      <View className="p-4 flex-row gap-3">
        {icon && (
          <View className="w-12 h-12 rounded-xl bg-slate-700 border border-slate-600 items-center justify-center overflow-hidden">
            {icon}
          </View>
        )}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1 gap-2">
            <Text className="text-[14px] font-black text-white uppercase flex-1" numberOfLines={1}>
              {title}
            </Text>
            {badge && <View>{badge}</View>}
          </View>

          {subtitle && (
            <Text className="text-[11px] font-bold text-slate-400 mb-1" numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {/* Data Fields */}
          {fields && fields.length > 0 && (
            <View className="gap-1 mt-0.5">
              {fields.map((field, idx) => (
                <View key={idx} className="flex-row justify-between items-center">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{field.label}</Text>
                  {typeof field.value === "string" ? (
                    <Text
                      className={`text-[10px] font-extrabold ${
                        field.highlight ? highlightColors[field.highlight] : "text-white"
                      }`}
                    >
                      {field.value}
                    </Text>
                  ) : (
                    field.value
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Actions Footer */}
      {actions && (
        <View className="flex-row justify-end items-center px-4 py-2 bg-slate-800/40 border-t border-slate-700/50 gap-2">
          {actions}
        </View>
      )}
    </Wrapper>
  );
}
