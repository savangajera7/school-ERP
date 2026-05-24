import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  type TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
        <Text className="text-[13px] font-semibold text-[#374151] mb-[6px]">
          {label}
        </Text>
      )}
      <View
        className={`
          rounded-xl border-[1.5px] flex-row items-center px-4
          ${error ? "border-red-500 bg-[#FFF5F5]" : isFocused ? "border-[#0d3666] bg-white" : "border-gray-200 bg-[#F9FAFB]"}
          ${className || ""}
        `}
        style={{ minHeight: 52 }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-[#111827]"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            {
              // 16px minimum prevents iOS zoom on focus
              fontSize: 16,
              paddingVertical: Platform.OS === 'ios' ? 14 : 12,
              minHeight: 48,
              ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}),
            } as any,
            style,
          ]}
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-[12px] text-red-500 mt-1.5 ml-1 font-medium">{error}</Text>
      )}
    </View>
  );
};
