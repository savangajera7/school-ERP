import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { premiumCardShadow } from "@/constants/premiumStyles";

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
  accentColor,
  noAccent = false,
}: MobileDataCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
      style={premiumCardShadow}
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
          }} 
        />
      )}

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
