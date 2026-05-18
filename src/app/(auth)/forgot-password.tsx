import React from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or mobile is required"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { forgotPasswordMutation } = useAuth();
  const { isMobile } = useBreakpoint();

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.identifier, {
      onSuccess: () => {
        router.push({
          pathname: "/(auth)/otp",
          params: { identifier: data.identifier },
        });
      },
    });
  };

  const renderContent = () => (
    <View className="w-full">
      <View className="items-center mb-6">
        <View className="w-[64px] h-[64px] bg-[#EFF6FF] rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">🔑</Text>
        </View>
        <Text className="text-[22px] font-bold text-gray-900 text-center">Forgot Password?</Text>
        <Text className="text-[14px] text-gray-500 text-center font-medium mt-2 px-4 leading-normal">
          Enter your email or mobile. We'll send an OTP.
        </Text>
      </View>

      <FormField
        control={control}
        name="identifier"
        label="Email or Mobile Number"
        placeholder="Enter your email or mobile"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View className="h-4" />

      <Button
        label="Send OTP"
        onPress={handleSubmit(onSubmit)}
        loading={forgotPasswordMutation.isPending}
      />

      {forgotPasswordMutation.isError && (
        <Text className="text-red-500 text-sm text-center mt-3 font-semibold">
          {forgotPasswordMutation.error?.message || "Failed to send OTP. Please try again."}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-6 items-center"
        style={Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined}
      >
        <Text className="text-[#0d3666] font-semibold text-[14px]">
          Remember your password? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isMobile ? (
          <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-4 pb-2">
              <BackButton />
            </View>

            <View className="px-6 pt-10 pb-10 flex-1 justify-center">
              {renderContent()}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Card style={{ maxWidth: 440 }} className="w-full">
              <View className="mb-6 align-self-start">
                <BackButton />
              </View>
              {renderContent()}
            </Card>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
