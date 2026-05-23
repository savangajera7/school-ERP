import React, { useEffect } from "react";
import { View, Animated, Easing, StyleSheet, Platform } from "react-native";

interface PremiumLoaderProps {
  size?: number;
  color?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ 
  size = 60, 
  color = "#0d3666" 
}) => {
  const rotateAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Pulse Circle */}
      <Animated.View 
        style={[
          styles.pulse, 
          { 
            borderColor: color, 
            opacity: 0.2,
            transform: [{ scale: scaleAnim }] 
          }
        ]} 
      />
      
      {/* Outer Rotating Ring */}
      <Animated.View 
        style={[
          styles.ring, 
          { 
            width: size, 
            height: size, 
            borderColor: color, 
            borderTopColor: "transparent",
            transform: [{ rotate: spin }] 
          }
        ]} 
      />

      {/* Inner Dot */}
      <View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            width: size / 4,
            height: size / 4,
            borderRadius: size / 8
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 1000,
    borderWidth: 3,
  },
  pulse: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    borderWidth: 2,
  },
  dot: {
    position: "absolute",
  },
});
