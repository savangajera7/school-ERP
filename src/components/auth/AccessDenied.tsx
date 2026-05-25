import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { IconCircle } from "@/components/icons/AppIcon";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  message?: string;
};

export function AccessDenied({
  message = "You do not have permission to view this page.",
}: Props) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-[#F4F6FA]">
      <IconCircle name="lock" size={64} iconSize={32} backgroundColor="#FEE2E2" color={SchoolTheme.error} />
      <Text className="text-lg font-black text-gray-900 mt-4 text-center">Access restricted</Text>
      <Text className="text-sm text-gray-500 text-center mt-2 leading-5">{message}</Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-6 px-6 py-3 rounded-xl bg-[#134A8C] min-h-[48px] justify-center"
      >
        <Text className="text-white font-bold">Go back</Text>
      </TouchableOpacity>
    </View>
  );
}
