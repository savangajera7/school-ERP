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
      className="rounded-2xl mb-3 border"
      style={[
        premiumCardShadow,
        {
          backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF",
          borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6",
        }
      ]}
    >
      {/* Accent Line (Subtle) */}
      {!noAccent && (accentColor || Colors.primary) && (
        <View 
          style={{ 
            position: 'absolute', 
            left: 0, 
            top: 16, 
            bottom: 16, 
            width: 3, 
            backgroundColor: accentColor || Colors.primary,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            zIndex: 10
          }} 
        />
      )}

      {/* Top Body Area */}
      <View className="p-4 flex-row gap-3 rounded-t-2xl" style={{ backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF" }}>
        {icon && (
          <View className="w-14 h-14 rounded-2xl border items-center justify-center overflow-hidden" style={{ backgroundColor: isDark ? "#1E293B" : "#F9FAFB", borderColor: isDark ? SchoolTheme.borderDark : "#E5E7EB" }}>
            {icon}
          </View>
        )}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1.5 gap-2">
            <Text className="text-sm font-extrabold uppercase flex-1" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textDark : "#111827" }}>
              {title}
            </Text>
            {badge && <View>{badge}</View>}
          </View>

          {subtitle && (
            <Text className="text-[12px] font-bold mb-1.5" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#6B7280" }}>
              {subtitle}
            </Text>
          )}

          {/* Data Fields */}
          {fields && fields.length > 0 && (
            <View className="gap-1 mt-1">
              {fields.map((field, idx) => (
                <View key={idx} className="flex-row justify-between items-center">
                  <Text className="text-[11px] font-bold" style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#9CA3AF" }}>{field.label}:</Text>
                  {typeof field.value === "string" ? (
                    <Text
                      className={`text-[11px] font-extrabold ${
                        field.highlight ? highlightColors[field.highlight] : ""
                      }`}
                      style={!field.highlight ? { color: isDark ? SchoolTheme.textDark : "#374151" } : {}}
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
        <View className="flex-row justify-end items-center px-4 py-3 border-t gap-2.5 rounded-b-2xl" style={{ backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6" }}>
          {actions}
        </View>
      )}
    </Wrapper>
  );
}
