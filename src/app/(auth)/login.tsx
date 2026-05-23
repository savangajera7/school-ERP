import React from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Dimensions, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from "expo-linear-gradient";

import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { useAuthStore } from "@/store/authStore";
import { translations } from "@/constants/translations";
import { usePostApiLoginLogin } from "@/api/generated/login/login";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const language = useAuthStore((state) => state.language);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const t = translations[language];
  
  const loginMutation = usePostApiLoginLogin();
  const { isMobile } = useBreakpoint();

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        const apiResult = response.data;
        if (apiResult.success && apiResult.data) {
          const user = apiResult.data;
          login(
            "mock_token", 
            "mock_refresh", 
            {
              id: user.userId?.toString() || "0",
              name: user.fullName || "User",
              email: user.emailAddress || "",
              mobile: user.phoneNumber || "",
              role: user.roleId === 1 ? "admin" : "parent",
              schoolName: "Little Angel's English School",
            },
            user.roleId === 1 ? "admin" : "parent"
          );
        }
      }
    });
  };

  const renderLanguageToggle = () => (
    <View style={styles.languageToggleContainer}>
      <View style={styles.languageToggleBackground}>
        <TouchableOpacity 
          onPress={() => setLanguage("en")}
          style={[styles.languageOption, language === "en" && styles.languageOptionActive]}
        >
          <Text style={[styles.languageText, language === "en" && styles.languageTextActive]}>{t.english}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setLanguage("gu")}
          style={[styles.languageOption, language === "gu" && styles.languageOptionActive]}
        >
          <Text style={[styles.languageText, language === "gu" && styles.languageTextActive]}>{t.gujarati}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      {renderLanguageToggle()}
      
      <FormField
        control={control}
        name="email"
        label={t.email}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<View style={styles.iconWrapper}><Text style={styles.inputIcon}>📧</Text></View>}
      />

      <FormField
        control={control}
        name="password"
        label={t.password}
        placeholder="Enter your password"
        isPassword
        leftIcon={<View style={styles.iconWrapper}><Text style={styles.inputIcon}>🔒</Text></View>}
      />

      <View style={styles.formOptions}>
        <View style={styles.rememberMe}>
          <View style={styles.checkbox} />
          <Text style={styles.rememberMeText}>{t.rememberMe}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
        </TouchableOpacity>
      </View>

      <Button
        label={t.signIn}
        onPress={handleSubmit(onSubmit)}
        loading={loginMutation.isPending}
        style={styles.signInButton}
      />

      {loginMutation.isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{(loginMutation.error as any)?.message || t.loginFailed}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {isMobile ? (
            <View style={{ flex: 1 }}>
              <Header title={t.welcome} subtitle={t.signInSubtitle} />
              <View style={styles.mobileCardContainer}>
                {renderForm()}
                <Text style={styles.footerText}>Powered by {t.schoolERP}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.desktopContainer}>
              <LinearGradient colors={["#0d3666", "#1e40af"]} style={styles.desktopBranding}>
                <View style={styles.brandingContent}>
                  <View style={styles.logoContainer}>
                    <Image source={require("../../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
                  </View>
                  <Text style={styles.brandingTitle}>{t.schoolERP}</Text>
                  <Text style={styles.brandingSubtitle}>{t.smartSystem}</Text>
                  <View style={styles.featureList}>
                    <FeatureItem icon="📊" text="Student Analytics" desc="Track academic performance with ease." />
                    <FeatureItem icon="⚡" text="Smart Fees" desc="Automated reminders and digital records." />
                    <FeatureItem icon="📱" text="Instant Alerts" desc="Direct parent-teacher communication." />
                  </View>
                </View>
              </LinearGradient>
              <View style={styles.desktopLoginForm}>
                <View style={styles.loginCardWrapper}>
                  <Text style={styles.loginTitle}>{t.welcome}</Text>
                  <Text style={styles.loginSubtitle}>{t.signInSubtitle}</Text>
                  {renderForm()}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text, desc }: { icon: string, text: string, desc: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Text style={{fontSize: 22}}>{icon}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.featureText}>{text}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mobileCardContainer: { 
    paddingHorizontal: 32, 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    paddingTop: 32, 
    flex: 1,
    marginTop: -30,
    minHeight: Dimensions.get('window').height * 0.6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  desktopContainer: { flex: 1, flexDirection: "row", height: "100%" },
  desktopBranding: { width: "42%", alignItems: "center", justifyContent: "center", padding: 40 },
  brandingContent: { width: "100%", maxWidth: 420, alignItems: "center" },
  desktopLoginForm: { width: "58%", backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", padding: 40 },
  logoContainer: { width: 160, height: 160, backgroundColor: "#fff", borderRadius: 80, padding: 25, marginBottom: 32, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 30, elevation: 20 },
  logo: { width: "100%", height: "100%" },
  brandingTitle: { color: "#fff", fontSize: 52, fontWeight: "900", textAlign: "center", letterSpacing: -1 },
  brandingSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 18, marginTop: 12, marginBottom: 56, fontWeight: "600", letterSpacing: 0.5 },
  featureList: { gap: 28, width: "100%" },
  featureItem: { flexDirection: "row", alignItems: "flex-start", gap: 20 },
  featureIconContainer: { width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  featureText: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  featureDesc: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4, lineHeight: 18, fontWeight: "500" },
  loginCardWrapper: { width: "100%", maxWidth: 500, paddingHorizontal: 64, paddingVertical: 64, borderRadius: 56, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 40, elevation: 25 },
  loginTitle: { fontSize: 44, fontWeight: "900", color: "#111827", letterSpacing: -1.5 },
  loginSubtitle: { fontSize: 18, color: "#9ca3af", marginTop: 8, marginBottom: 56, fontWeight: "600" },
  formContainer: { width: "100%" },
  languageToggleContainer: { alignItems: "center", marginBottom: 40 },
  languageToggleBackground: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 18, padding: 5, width: "100%", maxWidth: 280, borderWidth: 1, borderColor: "#e5e7eb" },
  languageOption: { flex: 1, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  languageOptionActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  languageText: { fontSize: 14, fontWeight: "800", color: "#9ca3af" },
  languageTextActive: { color: "#0d3666" },
  iconWrapper: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  inputIcon: { fontSize: 18 },
  formOptions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 40 },
  rememberMe: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#e5e7eb", backgroundColor: "#f9fafb" },
  rememberMeText: { fontSize: 15, color: "#6b7280", fontWeight: "600" },
  forgotPasswordText: { fontSize: 15, color: "#0d3666", fontWeight: "800" },
  signInButton: { height: 60, borderRadius: 20 },
  errorContainer: { backgroundColor: "#fef2f2", padding: 16, borderRadius: 16, marginTop: 24, borderWidth: 1, borderColor: "#fee2e2" },
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center", fontWeight: "bold" },
  footerText: { textAlign: "center", color: "#e5e7eb", fontSize: 13, fontWeight: "800", marginTop: 48, letterSpacing: 2 }
});
