import React from "react";
import { View, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BackButton } from "./BackButton";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
}) => {
  return (
    <LinearGradient
      colors={["#1E40AF", "#3B82F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="pt-16 pb-12 px-6 rounded-b-[28px] items-center justify-center h-[220px] relative"
    >
      {showBack && (
        <View className="absolute left-6 top-14">
          <BackButton light />
        </View>
      )}
      
      <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-3">
        <Text className="text-white text-2xl font-bold">🏫</Text>
      </View>

      <Text className="text-white text-[26px] font-bold text-center tracking-tight leading-tight">{title}</Text>
      {subtitle && (
        <Text className="text-white/70 text-[14px] text-center mt-1 font-medium">{subtitle}</Text>
      )}
    </LinearGradient>
  );
};
