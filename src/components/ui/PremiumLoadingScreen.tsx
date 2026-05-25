import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppBrandLogo } from "@/components/branding/AppBrandLogo";
import { useTranslation } from "@/hooks/useTranslation";
import { SchoolTheme } from "@/constants/theme";
import { Colors } from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export function PremiumLoadingScreen() {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrace animation
    Animated.parallel([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Loop animations
    const spinAnim = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnim.start();
    pulseAnim.start();

    return () => {
      spinAnim.stop();
      pulseAnim.stop();
    };
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative Background Elements */}
      <View style={styles.decorativeBg}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <View style={styles.content}>
        <Animated.View 
          style={{ 
            opacity: pulse, 
            transform: [{ scale }, { translateY: slideUp }],
            alignItems: "center" 
          }}
        >
          <AppBrandLogo
            size="lg"
            variant="stacked"
            light
            title={t.schoolName}
            tagline={t.smartSystem}
          />
        </Animated.View>

        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.4)", "white"]}
              style={styles.ringGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          <View style={styles.innerDot} />
        </View>

        <Animated.Text style={[styles.caption, { opacity: pulse }]}>
          {t.loadingApp}
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SchoolTheme.primary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  decorativeBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: height * 0.1,
    left: -width * 0.1,
  },
  circle3: {
    width: width * 0.3,
    height: width * 0.3,
    top: height * 0.4,
    left: width * 0.2,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  loaderContainer: {
    marginTop: 48,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 3,
  },
  ringGradient: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "transparent",
    borderTopColor: "white",
  },
  innerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  caption: {
    marginTop: 24,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  version: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "600",
  },
});
