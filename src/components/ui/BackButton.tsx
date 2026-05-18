import React from "react";
import { TouchableOpacity, Text, Platform } from "react-native";
import { router } from "expo-router";

interface BackButtonProps {
  light?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ light = false }) => {
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="flex-row items-center"
      style={Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text className={`text-[16px] font-semibold ${light ? "text-white" : "text-primary"}`}>
        ← Back
      </Text>
    </TouchableOpacity>
  );
};
