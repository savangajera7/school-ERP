import React from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPasswordMutation } = useAuth();
  const { isMobile } = useBreakpoint();

  const { control, handleSubmit, watch } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;

    resetPasswordMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          router.replace("/(auth)/login");
        },
      }
    );
  };

  const renderContent = () => (
    <View className="w-full">
      {/* Icon Area */}
      <View className="items-center mb-6">
        <View className="w-[64px] h-[64px] bg-[#EFF6FF] rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">🛡️</Text>
        </View>
        <Text className="text-[22px] font-bold text-gray-900 text-center">Reset Password</Text>
        <Text className="text-[14px] text-gray-500 text-center font-medium mt-2 px-4 leading-normal">
          Choose a strong password to protect your account.
        </Text>
      </View>

      {/* New Password */}
      <FormField
        control={control}
        name="password"
        label="New Password"
        placeholder="Enter new password"
        isPassword
      />

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <View className="mb-2 -mt-2">
          <PasswordStrength password={password} />
        </View>
      )}

      {/* Confirm Password */}
      <FormField
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        isPassword
      />

      <View className="h-4" />

      {/* Reset Password Button */}
      <Button
        label="Reset Password"
        onPress={handleSubmit(onSubmit)}
        loading={resetPasswordMutation.isPending}
      />

      {resetPasswordMutation.isError && (
        <Text className="text-red-500 text-sm text-center mt-3 font-semibold">
          {resetPasswordMutation.error?.message || "Reset failed. Please try again."}
        </Text>
      )}

      {resetPasswordMutation.isSuccess && (
        <View className="bg-emerald-50 rounded-xl p-3 mt-4 border border-emerald-100">
          <Text className="text-emerald-700 text-sm text-center font-semibold">
            ✅ Password reset successfully! Redirecting to login...
          </Text>
        </View>
      )}

      {/* Password Requirements */}
      <View className="mt-6 bg-[#F9FAFB] rounded-xl p-4 border border-gray-100">
        <Text className="text-gray-700 text-[13px] font-bold mb-3">
          Password Requirements:
        </Text>
        <PasswordRequirement
          met={password.length >= 8}
          text="At least 8 characters"
        />
        <PasswordRequirement
          met={/[A-Z]/.test(password) && /[a-z]/.test(password)}
          text="Upper & lowercase letters"
        />
        <PasswordRequirement
          met={/\d/.test(password)}
          text="At least one number"
        />
        <PasswordRequirement
          met={/[^A-Za-z0-9]/.test(password)}
          text="At least one special character"
        />
      </View>
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

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-2">
      <Text className={`text-[14px] ${met ? "text-[#f5921e] font-bold" : "text-gray-300 font-medium"}`}>
        {met ? "✓" : "○"}
      </Text>
      <Text
        className={`text-[13px] ${met ? "text-emerald-600 font-semibold" : "text-gray-500 font-medium"}`}
      >
        {text}
      </Text>
    </View>
  );
}
