import React from "react";
import { View, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";

/** OTP verification is not exposed in the current API — password reset uses email only. */
export default function OTPScreen() {
  const { identifier } = useLocalSearchParams<{ identifier?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <Card>
          <BackButton />
          <Text className="text-xl font-bold text-gray-900 mt-4">Check your email</Text>
          <Text className="text-sm text-gray-600 mt-3 leading-5">
            If {identifier ? `"${identifier}"` : "your account"} is registered, reset instructions were sent.
            This app does not use in-app OTP verification — use the link from your email or change password after login.
          </Text>
          <View className="mt-6 gap-3">
            <Button label="Back to sign in" onPress={() => router.replace("/(auth)/login")} />
            <Button
              label="Change password (logged in)"
              variant="secondary"
              onPress={() => router.replace("/(app)/change-password")}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
