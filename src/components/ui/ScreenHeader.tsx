import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useResponsive } from "@/hooks/useResponsive";
import { AppIcon } from "@/components/icons/AppIcon";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";

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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  if (flat) {
    return (
      <View
        className="bg-white border-b border-gray-100 justify-center z-10"
        style={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingTop: (insets.top || 0) + (isMobile ? 14 : 18),
          paddingBottom: isMobile ? 14 : 18,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3 flex-1">
            {!hideBack && (
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-200"
                activeOpacity={0.7}
              >
                <AppIcon name="chevronBack" size={22} color="#374151" />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              <Text
                className="font-black text-gray-900"
                style={{ fontSize: isMobile ? 20 : 24 }}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  className="text-gray-400 font-semibold mt-0.5"
                  style={{ fontSize: isMobile ? 11 : 13 }}
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
        paddingHorizontal: isMobile ? 16 : 24,
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
