import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  className,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
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
        <TextInput
          className="flex-1 h-full text-[15px] text-[#111827] pr-10"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!visible}
          autoCorrect={false}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setVisible(!visible)}
          className="absolute right-4 top-0 bottom-0 justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm text-text-secondary font-semibold">
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
