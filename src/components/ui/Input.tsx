import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
          h-[52px] rounded-xl border-[1.5px] flex-row items-center px-4
          ${error ? "border-red-500 bg-[#FFF5F5]" : isFocused ? "border-blue-500 bg-white" : "border-gray-200 bg-[#F9FAFB]"}
          ${className || ""}
        `}
        style={isFocused && !error ? {
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 2,
        } : undefined}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 h-full text-[15px] text-[#111827]"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
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
