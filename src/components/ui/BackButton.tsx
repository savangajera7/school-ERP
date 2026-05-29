import React from "react";
import { TouchableOpacity, Text, Platform, View } from "react-native";
import { router } from "expo-router";
import { AppIcon } from "@/components/icons/AppIcon";
import { SchoolTheme } from "@/constants/theme";

interface BackButtonProps {
  light?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ light = false }) => {
  const color = light ? "#fff" : SchoolTheme.primary;
  return (
    <TouchableOpacity
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          const { useAuthStore } = require("@/store/authStore");
          const { getHomeRoute } = require("@/utils/roleRouting");
          const role = useAuthStore.getState().role;
          router.replace(getHomeRoute(role));
        }
      }}
      className="flex-row items-center gap-1"
      style={Platform.OS === "web" ? ({ cursor: "pointer" } as object) : undefined}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <AppIcon name="chevronBack" size={20} color={color} />
      <Text
        className={`text-[16px] font-semibold ${light ? "text-white" : "text-primary"}`}
        style={light ? undefined : { color: SchoolTheme.primary }}
      >
        Back
      </Text>
    </TouchableOpacity>
  );
};
