import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

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
}

const highlightColors = {
  primary: "text-[#0d3666]",
  accent: "text-[#f5921e]",
  success: "text-emerald-600",
  error: "text-red-600",
  muted: "text-gray-500",
};

export function MobileDataCard({
  title,
  subtitle,
  icon,
  badge,
  fields,
  actions,
  onPress,
}: MobileDataCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
      style={{
        boxShadow: "0px 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          {icon && <View>{icon}</View>}
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-gray-900" numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text className="text-[12px] text-gray-400 font-semibold mt-0.5" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {badge && <View className="ml-2">{badge}</View>}
      </View>

      {/* Data Fields */}
      {fields && fields.length > 0 && (
        <View className="bg-gray-50/50 rounded-xl p-3 gap-2 mb-3">
          {fields.map((field, idx) => (
            <View key={idx} className="flex-row justify-between items-center">
              <Text className="text-[12px] text-gray-400 font-semibold">{field.label}</Text>
              {typeof field.value === "string" ? (
                <Text
                  className={`text-[12px] font-bold ${
                    field.highlight ? highlightColors[field.highlight] : "text-gray-700"
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

      {/* Actions */}
      {actions && <View className="flex-row gap-2">{actions}</View>}
    </Wrapper>
  );
}
