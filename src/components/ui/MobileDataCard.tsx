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
      className="bg-white rounded-2xl mb-3 border border-gray-100"
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
            zIndex: 10
          }} 
        />
      )}

      {/* Top Body Area */}
      <View className="p-4 flex-row gap-3 rounded-t-2xl bg-white">
        {icon && (
          <View className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden">
            {icon}
          </View>
        )}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1.5 gap-2">
            <Text className="text-sm font-extrabold text-gray-900 uppercase flex-1" numberOfLines={1}>
              {title}
            </Text>
            {badge && <View>{badge}</View>}
          </View>

          {subtitle && (
            <Text className="text-[12px] text-gray-500 font-bold mb-1.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {/* Data Fields */}
          {fields && fields.length > 0 && (
            <View className="gap-1 mt-1">
              {fields.map((field, idx) => (
                <View key={idx} className="flex-row justify-between items-center">
                  <Text className="text-[11px] text-gray-400 font-bold">{field.label}:</Text>
                  {typeof field.value === "string" ? (
                    <Text
                      className={`text-[11px] font-extrabold ${
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
        </View>
      </View>

      {/* Actions Footer */}
      {actions && (
        <View className="flex-row justify-end items-center px-4 py-3 bg-slate-50 border-t border-gray-100 gap-2.5 rounded-b-2xl">
          {actions}
        </View>
      )}
    </Wrapper>
  );
}
