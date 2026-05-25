import React from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from "expo-linear-gradient";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { AppBrandLogo } from "@/components/branding/AppBrandLogo";
import { PoweredByFooter } from "@/components/branding/PoweredByFooter";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { AppIcon } from "@/components/icons/AppIcon";
import { SchoolTheme } from "@/constants/theme";
import { getHomeRoute } from "@/utils/roleRouting";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const { t, language, setLanguage } = useTranslation();
  const { signInWithApi, apiLoginMutation } = useAuth();
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const { isMobile } = useResponsive();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(getHomeRoute(role) as never);
    }
  }, [isAuthenticated, role]);

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    const result = await signInWithApi(data.email, data.password);
    if (!result.ok) {
      setLoginError(result.error ?? t.loginFailed);
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <FormField
        control={control}
        name="email"
        label={t.email}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => {
          // You could optionally focus the password field here using a ref
        }}
        leftIcon={
          <View style={styles.iconCircle}>
            <AppIcon name="email" size={18} color={SchoolTheme.primary} />
          </View>
        }
      />

      <FormField
        control={control}
        name="password"
        label={t.password}
        placeholder="Enter your password"
        isPassword
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
        leftIcon={
          <View style={styles.iconCircle}>
            <AppIcon name="lock" size={18} color={SchoolTheme.primary} />
          </View>
        }
      />

      <View style={styles.formOptions}>
        <TouchableOpacity style={styles.rememberMe} activeOpacity={0.7}>
          <View style={styles.checkbox} />
          <Text style={styles.rememberMeText}>{t.rememberMe}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} activeOpacity={0.7}>
          <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
        </TouchableOpacity>
      </View>

      <Button
        label={t.signIn}
        onPress={handleSubmit(onSubmit)}
        loading={apiLoginMutation.isPending}
        style={styles.signInButton}
        className="shadow-lg shadow-primary/30"
      />

      {(loginError || apiLoginMutation.isError) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {loginError ||
              (apiLoginMutation.error as Error)?.message ||
              t.loginFailed}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {isMobile ? (
            <View style={{ flex: 1, backgroundColor: Colors.primary }}>
              <LinearGradient 
                   colors={[Colors.gradientStart, Colors.gradientEnd]} 
                   style={[styles.mobileHeader, { paddingTop: insets.top + 20 }]}
                 >
                <View style={styles.langRow}>
                  <TouchableOpacity
                    style={[styles.langChip, language === "gu" && styles.langChipActive]}
                    onPress={() => setLanguage("gu")}
                  >
                    <Text style={[styles.langChipText, language === "gu" && styles.langChipTextActive]}>ગુજરાતી</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.langChip, language === "en" && styles.langChipActive]}
                    onPress={() => setLanguage("en")}
                  >
                    <Text style={[styles.langChipText, language === "en" && styles.langChipTextActive]}>English</Text>
                  </TouchableOpacity>
                </View>
                <AppBrandLogo
                  size="lg"
                  variant="stacked"
                  light
                  title={t.schoolName}
                  tagline={t.smartSystem}
                />
              </LinearGradient>
              <View style={styles.mobileCardContainer}>
                <View style={styles.mobileFormWrap}>
                  <Text style={[styles.loginTitle, styles.centerText]}>{t.welcome}</Text>
                  <Text style={[styles.loginSubtitle, styles.centerText, { marginBottom: 16 }]}>
                    {t.signInSubtitle}
                  </Text>
                  {renderForm()}
                </View>
                <PoweredByFooter />
              </View>
            </View>
          ) : (
            <View style={styles.desktopContainer}>
              <LinearGradient 
                colors={[Colors.gradientStart, Colors.gradientEnd]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.desktopBranding}
              >
                {/* Decorative Elements */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                
                <View style={styles.brandingContent}>
                  <AppBrandLogo
                    size="lg"
                    variant="stacked"
                    light
                    title={t.schoolName}
                    tagline={t.smartSystem}
                  />
                  <PoweredByFooter light style={{ marginTop: 48 }} />
                </View>
              </LinearGradient>
              <View style={styles.desktopLoginForm}>
                <View style={styles.loginCardWrapper}>
                  <Text style={styles.loginTitle}>{t.welcome}</Text>
                  <Text style={styles.loginSubtitle}>{t.signInSubtitle}</Text>
                  {renderForm()}
                </View>
                <PoweredByFooter style={{ position: "absolute", bottom: 24, alignSelf: "center" }} />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  container: { flex: 1, backgroundColor: Colors.primary },
  mobileHeader: {
    paddingBottom: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  langRow: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "flex-end",
    marginBottom: 0,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  langChipActive: {
    backgroundColor: "#fff",
  },
  langChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.8)",
  },
  langChipTextActive: {
    color: Colors.primary,
  },
  logoContainerSmall: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  mobileSubtitle: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  mobileCardContainer: { 
    paddingHorizontal: 28, 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    paddingTop: 24, 
    flex: 1,
    marginTop: -40,
    minHeight: Dimensions.get('window').height * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  desktopContainer: { flex: 1, flexDirection: "row", height: "100%" },
  desktopBranding: { width: "42%", alignItems: "center", justifyContent: "center", padding: 40, overflow: 'hidden' },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -50,
    left: -50,
  },
  brandingContent: { width: "100%", maxWidth: 420, alignItems: "center", zIndex: 1 },
  desktopLoginForm: {
    width: "58%",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    position: "relative",
  },
  mobileFormWrap: {
    width: "100%",
    marginBottom: 12,
  },
  centerText: { textAlign: "center", marginBottom: 8 },
  logoContainer: { 
    width: 160, 
    height: 160, 
    backgroundColor: "#fff", 
    borderRadius: 80, 
    padding: 10, 
    marginBottom: 32, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 30, 
    elevation: 20 
  },
  logo: { width: "100%", height: "100%" },
  brandingTitle: { color: "#fff", fontSize: 52, fontWeight: "900", textAlign: "center", letterSpacing: -1 },
  brandingSubtitle: { color: Colors.accent, fontSize: 24, marginTop: 4, marginBottom: 56, fontWeight: "800", letterSpacing: 2, textTransform: 'uppercase' },
  featureList: { gap: 28, width: "100%" },
  featureItem: { flexDirection: "row", alignItems: "flex-start", gap: 20 },
  featureIconContainer: { width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  featureText: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  featureDesc: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4, lineHeight: 18, fontWeight: "500" },
  loginCardWrapper: { 
    width: "100%", 
    maxWidth: 480, 
    paddingHorizontal: 48, 
    paddingVertical: 56, 
    borderRadius: 40, 
    backgroundColor: "#fff", 
    shadowColor: "#000", 
    shadowOpacity: 0.05, 
    shadowRadius: 30, 
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  loginTitle: { fontSize: 36, fontWeight: "900", color: "#0d3666", letterSpacing: -1 },
  loginSubtitle: { fontSize: 16, color: "#6b7280", marginTop: 4, marginBottom: 32, fontWeight: "500" },
  formContainer: { width: "100%" },
  roleHint: {
    fontSize: 13,
    color: SchoolTheme.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  languageToggleContainer: { alignItems: "center", marginBottom: 32 },
  languageToggleBackground: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 18, padding: 5, width: "100%", maxWidth: 280, borderWidth: 1, borderColor: "#e5e7eb" },
  languageOption: { flex: 1, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  languageOptionActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  languageText: { fontSize: 14, fontWeight: "800", color: "#9ca3af" },
  languageTextActive: { color: Colors.primary },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconText: { fontSize: 16 },
  iconWrapper: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  inputIcon: { fontSize: 18 },
  formOptions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 24 },
  rememberMe: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 6, 
    borderWidth: 1.5, 
    borderColor: "#E5E7EB", 
    backgroundColor: "#F9FAFB",
    alignItems: 'center',
    justifyContent: 'center'
  },
  rememberMeText: { fontSize: 15, color: "#6b7280", fontWeight: "600" },
  forgotPasswordText: { fontSize: 15, color: Colors.primary, fontWeight: "800" },
  signInButton: { 
    height: 56, 
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8
  },
  errorContainer: { backgroundColor: "#fef2f2", padding: 16, borderRadius: 16, marginTop: 24, borderWidth: 1, borderColor: "#fee2e2" },
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center", fontWeight: "bold" },
});
