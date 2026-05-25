import React from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";

/** Token-based reset is not in the API — use change-password when logged in. */
export default function ResetPasswordScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <Card>
          <BackButton />
          <Text className="text-xl font-bold text-gray-900 mt-4">Reset password</Text>
          <Text className="text-sm text-gray-600 mt-3 leading-5">
            Use Forgot password on the sign-in screen, or change your password from Profile after logging in.
          </Text>
          <View className="mt-6 gap-3">
            <Button label="Sign in" onPress={() => router.replace("/(auth)/login")} />
            <Button
              label="Change password (app)"
              variant="secondary"
              onPress={() => router.replace("/(app)/change-password")}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
