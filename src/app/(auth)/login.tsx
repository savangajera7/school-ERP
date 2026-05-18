import React from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from "expo-linear-gradient";

import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or mobile is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { loginMutation } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const renderForm = () => (
    <>
      <FormField
        control={control}
        name="identifier"
        label="Email or Mobile Number"
        placeholder="Enter your email or mobile"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormField
        control={control}
        name="password"
        label="Password"
        placeholder="Enter your password"
        isPassword
      />

      <View className="flex-row items-center justify-between mt-3 mb-6">
        <View className="flex-row items-center gap-2">
          <View className="w-5 h-5 rounded border border-gray-200 bg-[#F9FAFB]" />
          <Text className="text-sm text-gray-500 font-medium">
            Remember me
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
          style={Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined}
        >
          <Text className="text-sm text-[#0d3666] font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        label="Sign In"
        onPress={handleSubmit(onSubmit)}
        loading={loginMutation.isPending}
      />

      {loginMutation.isError && (
        <Text className="text-red-500 text-sm text-center mt-3 font-semibold">
          {loginMutation.error?.message || "Login failed. Please try again."}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style={isMobile ? "light" : "dark"} translucent backgroundColor="transparent" />
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
            <Header
              title="Welcome Back"
              subtitle="Sign in to your account"
            />

            <View className="px-6 -mt-[20px] bg-white rounded-t-[28px] pt-8 pb-10 flex-1">
              {renderForm()}
              
              <View className="mt-auto pt-10 items-center">
                <Text className="text-gray-400 text-[13px] font-medium">
                  School ERP v1.0
                </Text>
                <Text className="text-gray-400/70 text-[11px] mt-1 font-medium">
                  Powered by School Management System
                </Text>
              </View>
            </View>
          </ScrollView>
        ) : isTablet ? (
          <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Card className="w-full">
              <View className="items-center mb-6">
                <View className="w-[80px] h-[80px] bg-[#EFF6FF] rounded-2xl items-center justify-center mb-3">
                  <Text className="text-3xl">🏫</Text>
                </View>
                <Text className="text-[24px] font-bold text-gray-900">Welcome Back</Text>
                <Text className="text-[14px] text-gray-500 font-medium mt-1">School ERP</Text>
              </View>

              <View className="h-[1px] bg-gray-100 w-full mb-6" />

              {renderForm()}
            </Card>
          </ScrollView>
        ) : (
          <View className="flex-grow flex-row h-full">
            <LinearGradient
              colors={["#1E40AF", "#1E3A8A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-1/2 items-center justify-center p-12"
            >
              <View className="max-w-[480px] w-full">
                <View className="w-[120px] h-[120px] bg-white/10 rounded-3xl items-center justify-center mb-6">
                  <Text className="text-5xl">🏫</Text>
                </View>
                <Text className="text-white text-[36px] font-bold tracking-tight">School ERP</Text>
                <Text className="text-white/70 text-[16px] font-medium mt-2 mb-10">Smart School Management System</Text>

                <View className="gap-5">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white text-[20px]">✓</Text>
                    <Text className="text-white text-[15px] font-semibold">Manage Students & Teachers</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white text-[20px]">✓</Text>
                    <Text className="text-white text-[15px] font-semibold">Track Attendance & Fees</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white text-[20px]">✓</Text>
                    <Text className="text-white text-[15px] font-semibold">Parent Communication Portal</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View className="w-1/2 bg-gray-50 items-center justify-center p-12">
              <Card className="w-full">
                <View className="items-center mb-6">
                  <View className="w-[96px] h-[96px] bg-[#EFF6FF] rounded-3xl items-center justify-center mb-3">
                    <Text className="text-4xl">🏫</Text>
                  </View>
                  <Text className="text-[26px] font-bold text-gray-900">Welcome Back</Text>
                  <Text className="text-[14px] text-gray-500 font-medium mt-1">School ERP</Text>
                </View>

                <View className="h-[1px] bg-gray-100 w-full mb-6" />

                {renderForm()}
              </Card>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
