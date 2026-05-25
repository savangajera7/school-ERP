import React, { useEffect } from "react";
import { router } from "expo-router";
import { View, StyleSheet, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { getHomeRoute } from "@/utils/roleRouting";

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
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/school-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Little Angel&apos;s</Text>
        <Text style={styles.schoolName}>English School</Text>
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
  },
  logoContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 75,
    padding: 10,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: -4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    marginTop: 48,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  }
});
