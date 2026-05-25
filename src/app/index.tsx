import React, { useEffect } from "react";
import { router } from "expo-router";
import { View, StyleSheet, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { getHomeRoute } from "@/utils/roleRouting";
import { AppBrandLogo } from "@/components/branding/AppBrandLogo";

const SPLASH_MS = 1400;

export default function EntryPoint() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        const role = useAuthStore.getState().role;
        router.replace(getHomeRoute(role) as never);
      } else {
        router.replace("/(auth)/login");
      }
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        <AppBrandLogo 
          size="lg" 
          variant="stacked" 
          light 
        />
        <View style={styles.loaderContainer}>
          <PremiumLoader color="#ffffff" size={40} />
        </View>
      </View>
      <Text style={styles.footer}>SCHOOL ERP • SMART MANAGEMENT</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: -40, // Move splash content up slightly
  },
  loaderContainer: {
    marginTop: 48,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
});
