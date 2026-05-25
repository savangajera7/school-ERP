import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppBrandLogo } from "@/components/branding/AppBrandLogo";
import { useTranslation } from "@/hooks/useTranslation";
import { SchoolTheme } from "@/constants/theme";

export function PremiumLoadingScreen() {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(0.6)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const s = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    p.start();
    s.start();
    return () => {
      p.stop();
      s.stop();
    };
  }, [pulse, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={[SchoolTheme.primaryDark, SchoolTheme.primary]}
      style={styles.root}
    >
      <Animated.View style={{ opacity: pulse, alignItems: "center" }}>
        <AppBrandLogo
          size="lg"
          variant="stacked"
          light
          title={t.schoolName}
          tagline={t.smartSystem}
        />
      </Animated.View>
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
      <Text style={styles.caption}>{t.loadingApp}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  ring: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
    borderTopColor: SchoolTheme.accent,
    marginTop: 28,
  },
  caption: {
    marginTop: 16,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
  },
});
