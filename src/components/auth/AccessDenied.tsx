import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";

type Props = {
  message?: string;
};

export function AccessDenied({
  message = "You do not have permission to view this screen.",
}: Props) {
  useEffect(() => {
    const t = setTimeout(() => router.replace("/(app)/dashboard"), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 items-center justify-center p-8 bg-[#F8FAFC]">
      <Text className="text-4xl mb-4">🔒</Text>
      <Text className="text-lg font-black text-gray-800 text-center">Access restricted</Text>
      <Text className="text-sm text-gray-500 text-center mt-2 leading-5">{message}</Text>
      <View className="mt-6 w-full max-w-[240px]">
        <Button label="Go to dashboard" onPress={() => router.replace("/(app)/dashboard")} />
      </View>
    </View>
  );
}
