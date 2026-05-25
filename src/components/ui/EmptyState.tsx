import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";

type Props = {
  icon?: AppIconName;
  title?: string;
  message?: string;
};

export function EmptyState({
  icon = "empty",
  title = "No data yet",
  message = "Records will appear here once added from the server.",
}: Props) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <IconCircle name={icon} size={56} iconSize={28} />
      <Text className="text-base font-black text-gray-800 text-center mt-4">{title}</Text>
      <Text className="text-sm text-gray-500 text-center mt-2 leading-5">{message}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <IconCircle name="warning" size={48} backgroundColor="#FEF3C7" color="#B45309" />
      <Text className="text-sm font-semibold text-center mt-3" style={{ color: Colors.error }}>
        {message}
      </Text>
    </View>
  );
}
