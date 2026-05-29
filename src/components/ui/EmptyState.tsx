import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";
import { SchoolTheme } from "@/constants/theme";

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="items-center justify-center py-16 px-8">
      <IconCircle name={icon} size={56} iconSize={28} />
      <Text className="text-base font-black text-center mt-4" style={{ color: isDark ? SchoolTheme.textDark : "#1F2937" }}>{title}</Text>
      <Text className="text-sm text-center mt-2 leading-5" style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#6B7280" }}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="items-center justify-center py-12 px-6">
      <IconCircle name="warning" size={48} backgroundColor="#FEF3C7" color="#B45309" />
      <Text className="text-sm font-semibold text-center mt-3" style={{ color: Colors.error }}>
        {message}
      </Text>
    </View>
  );
}
