import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  type TextInputProps,
} from "react-native";
import { useColorScheme } from "nativewind";
import { SchoolTheme } from "@/constants/theme";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  leftIcon,
  className,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-[13px] font-semibold mb-[6px]" style={{ color: isDark ? SchoolTheme.textDark : "#374151" }}>
          {label}
        </Text>
      )}
      <View
        className={`
          rounded-xl border-[1.5px] flex-row items-center px-4
          ${error ? "border-red-500" : isFocused ? "border-[#0d3666]" : "border-gray-200"}
          ${className || ""}
        `}
        style={{
          minHeight: 52,
          backgroundColor: error
            ? (isDark ? "#7F1D1D" : "#FFF5F5")
            : isFocused
            ? (isDark ? SchoolTheme.cardDark : "#FFFFFF")
            : (isDark ? "#1E293B" : "#F9FAFB"),
          borderColor: error
            ? "#EF4444"
            : isDark
            ? SchoolTheme.borderDark
            : undefined,
        }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 pr-10"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!visible}
          autoCorrect={false}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            {
              fontSize: 16,
              paddingVertical: Platform.OS === 'ios' ? 14 : 12,
              minHeight: 48,
              color: isDark ? SchoolTheme.textDark : "#111827",
              ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}),
            } as any,
            style,
          ]}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setVisible(!visible)}
          className="absolute right-4 top-0 bottom-0 justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm font-bold" style={{ color: "#0d3666" }}>
            {visible ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>
      {error && (
        <Text className="text-[12px] text-red-500 mt-1.5 ml-1 font-medium">{error}</Text>
      )}
    </View>
  );
};
