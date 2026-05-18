import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/auth/OTPInput";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatCountdown } from "@/utils/helpers";

const COUNTDOWN_DURATION = 60;

export default function OTPScreen() {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const { verifyOTPMutation, forgotPasswordMutation } = useAuth();
  const { isMobile } = useBreakpoint();

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const canResend = countdown === 0;

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerify = useCallback(() => {
    if (otp.length !== 6 || !identifier) return;

    verifyOTPMutation.mutate(
      { identifier, otp },
      {
        onSuccess: (data) => {
          router.push({
            pathname: "/(auth)/reset-password",
            params: { token: data.token },
          });
        },
      }
    );
  }, [otp, identifier, verifyOTPMutation]);

  const handleResend = useCallback(() => {
    if (!canResend || !identifier) return;

    forgotPasswordMutation.mutate(identifier, {
      onSuccess: () => {
        setCountdown(COUNTDOWN_DURATION);
        setOtp("");
      },
    });
  }, [canResend, identifier, forgotPasswordMutation]);

  const handleOTPComplete = useCallback(
    (completedOtp: string) => {
      if (!identifier) return;

      verifyOTPMutation.mutate(
        { identifier, otp: completedOtp },
        {
          onSuccess: (data) => {
            router.push({
              pathname: "/(auth)/reset-password",
              params: { token: data.token },
            });
          },
        }
      );
    },
    [identifier, verifyOTPMutation]
  );

  const renderContent = () => (
    <View className="w-full">
      <View className="items-center mb-6">
        <View className="w-[64px] h-[64px] bg-[#EFF6FF] rounded-full items-center justify-center mb-4">
          <Text className="text-2xl">🔒</Text>
        </View>
        <Text className="text-[22px] font-bold text-gray-900 text-center">Verify OTP</Text>
        <Text className="text-[14px] text-gray-500 text-center font-medium mt-2 px-4 leading-normal">
          We sent a 6-digit code to{"\n"}
          <Text className="font-semibold text-gray-850">{identifier || "your contact"}</Text>
        </Text>
      </View>

      <OTPInput
        value={otp}
        onChange={setOtp}
        onComplete={handleOTPComplete}
        error={verifyOTPMutation.isError}
      />

      <View className="h-4" />

      <Button
        label="Verify OTP"
        onPress={handleVerify}
        loading={verifyOTPMutation.isPending}
        disabled={otp.length !== 6}
      />

      {verifyOTPMutation.isError && (
        <Text className="text-red-500 text-sm text-center mt-3 font-semibold">
          {verifyOTPMutation.error?.message || "Invalid OTP. Please try again."}
        </Text>
      )}

      {/* Resend Link/Timer below button */}
      <View className="mt-6 items-center">
        {canResend ? (
          <TouchableOpacity
            onPress={handleResend}
            disabled={forgotPasswordMutation.isPending}
            style={Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined}
          >
            <Text className="text-[#0d3666] font-semibold text-[14px]">
              Resend OTP
            </Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-[#4B5563] text-[14px] font-medium">
            Resend OTP in{" "}
            <Text className="font-semibold text-gray-900">
              {formatCountdown(countdown)}
            </Text>
          </Text>
        )}
      </View>

      {/* Mock hint */}
      <View className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
        <Text className="text-amber-700 text-[13px] text-center font-semibold">
          💡 For demo: use OTP "123456"
        </Text>
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
