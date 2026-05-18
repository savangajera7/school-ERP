import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { router } from "expo-router";

export default function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate to login after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.primaryLight, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      {/* Logo */}
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
        className="w-28 h-28 bg-white/20 rounded-3xl items-center justify-center mb-6 border border-white/30"
      >
        <Text className="text-6xl">🎓</Text>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text className="text-white text-4xl font-bold text-center tracking-wider">
          School ERP
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: subtitleOpacity }}>
        <Text className="text-white/70 text-base mt-3 text-center">
          Smart School Management System
        </Text>
      </Animated.View>

      {/* Bottom indicator */}
      <Animated.View
        style={{ opacity: subtitleOpacity }}
        className="absolute bottom-16"
      >
        <View className="w-8 h-1 bg-white/30 rounded-full" />
      </Animated.View>
    </LinearGradient>
  );
}
