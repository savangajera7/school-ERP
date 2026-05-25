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
}

export function ScreenHeader({
  title,
  subtitle,
  rightAction,
  flat = false,
  onBack,
  hideBack = false,
  showTopBar = false,
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
        className="bg-white border-b border-gray-100 flex-row justify-between items-center z-10"
        style={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingTop: (insets.top || 0) + (isMobile ? 14 : 18),
          paddingBottom: isMobile ? 14 : 18,
        }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          {!hideBack && (
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
              activeOpacity={0.7}
            >
              <AppIcon name="chevronBack" size={22} color="#374151" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text
              className="font-black text-gray-900"
              style={{ fontSize: isMobile ? 16 : 18 }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-gray-400 font-semibold mt-0.5"
                style={{ fontSize: isMobile ? 11 : 12 }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction && <View className="ml-3">{rightAction}</View>}
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
        paddingBottom: isMobile ? (showTopBar ? 56 : 40) : 48,
        borderBottomLeftRadius: isMobile ? 24 : 32,
        borderBottomRightRadius: isMobile ? 24 : 32,
      }}
    >
      <View>
        {showTopBar && (
          <View className="mb-4">
            <DashboardTopBar />
          </View>
        )}
        <View className="flex-row items-center">
          <View className="flex-row items-center gap-3 flex-1 min-w-0">
            {!hideBack && (
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/20"
                activeOpacity={0.7}
              >
                <AppIcon name="chevronBack" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            {(title !== "" || subtitle !== "") && (
              <View className="flex-1 min-w-0">
                {title !== "" && (
                  <Text
                    className="font-black text-white"
                    style={{ fontSize: isMobile ? 17 : 20 }}
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    className="text-white/60 font-bold uppercase tracking-wider mt-0.5"
                    style={{ fontSize: isMobile ? 10 : 12 }}
                    numberOfLines={2}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </View>
          {rightAction && !isMobile ? (
            <View style={{ marginLeft: 12, flexShrink: 0 }}>{rightAction}</View>
          ) : null}
        </View>
        {rightAction && isMobile ? (
          <View style={{ marginTop: 12, alignSelf: "stretch" }}>{rightAction}</View>
        ) : null}
      </View>
    </LinearGradient>
  );
}
