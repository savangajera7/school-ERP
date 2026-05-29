import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { AppIcon } from "@/components/icons/AppIcon";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { useColorScheme } from "nativewind";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional breadcrumb segments shown above title */
  breadcrumb?: string[];
  /** Right-side action button */
  rightAction?: React.ReactNode;
  /** Use flat white header instead of gradient */
  flat?: boolean;
  /** Custom back action, defaults to router.back() */
  onBack?: () => void;
  /** Hide the back button (e.g. for root screens) */
  hideBack?: boolean;
  /** Show the user dashboard top bar (greeting, avatar) */
  showTopBar?: boolean;
  /** Content to render inside the header gradient */
  children?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  rightAction,
  flat = false,
  onBack,
  hideBack = false,
  showTopBar = false,
  children,
}: ScreenHeaderProps) {
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      const { useAuthStore } = require("@/store/authStore");
      const { getHomeRoute } = require("@/utils/roleRouting");
      const role = useAuthStore.getState().role;
      router.replace(getHomeRoute(role));
    }
  };

  if (flat) {
    const flatBg = colorScheme === "dark" ? "#1E293B" : "#FFFFFF";
    const flatBorder = colorScheme === "dark" ? "#334155" : "#F3F4F6";
    const titleColor = colorScheme === "dark" ? "#F1F5F9" : "#111827";
    const subtitleColor = colorScheme === "dark" ? "#94A3B8" : "#9CA3AF";
    const backBg = colorScheme === "dark" ? "#0F172A" : "#F9FAFB";
    const backBorder = colorScheme === "dark" ? "#334155" : "#E5E7EB";
    const backIcon = colorScheme === "dark" ? "#94A3B8" : "#374151";
    return (
      <View
        style={{
          backgroundColor: flatBg,
          borderBottomWidth: 1,
          borderBottomColor: flatBorder,
          justifyContent: "center",
          zIndex: 10,
          paddingHorizontal: isMobile ? 16 : 32,
          paddingTop: (insets.top || 0) + (isMobile ? 14 : 18),
          paddingBottom: isMobile ? 14 : 18,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3 flex-1">
            {!hideBack && (
              <TouchableOpacity
                onPress={handleBack}
                style={{ backgroundColor: backBg, borderWidth: 1, borderColor: backBorder }}
                className="w-10 h-10 rounded-xl items-center justify-center"
                activeOpacity={0.7}
              >
                <AppIcon name="chevronBack" size={22} color={backIcon} />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              <Text
                style={{ fontSize: isMobile ? 20 : 24, color: titleColor }}
                className="font-black"
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={{ fontSize: isMobile ? 11 : 13, color: subtitleColor }}
                  className="font-semibold mt-0.5"
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction && <View className="ml-3">{rightAction}</View>}
        </View>
        {children && <View className="mt-4">{children}</View>}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: isMobile ? 16 : 32,
        paddingTop: (insets.top || 0) + (isMobile ? 14 : 20),
        paddingBottom: isMobile ? (showTopBar ? 64 : 40) : 64,
        borderBottomLeftRadius: isMobile ? 32 : 0,
        borderBottomRightRadius: isMobile ? 32 : 0,
      }}
    >
      {showTopBar ? (
        <DashboardTopBar />
      ) : (
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3 flex-1">
            {!hideBack && (
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/10"
                activeOpacity={0.7}
              >
                <AppIcon name="chevronBack" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              {title && (
                <Text
                  className="font-black text-white"
                  style={{ fontSize: isMobile ? 22 : 28 }}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  className="text-white/60 font-semibold mt-0.5"
                  style={{ fontSize: isMobile ? 12 : 14 }}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction && <View className="ml-3">{rightAction}</View>}
        </View>
      )}
      {children}
    </LinearGradient>
  );
}
