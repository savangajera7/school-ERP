import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/colors";

interface LoaderProps {
  fullScreen?: boolean;
  size?: "small" | "large";
  color?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  fullScreen = false,
  size = "large",
  color = Colors.primary,
}) => {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-4">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};
