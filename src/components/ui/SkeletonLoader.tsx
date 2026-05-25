import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, Platform, StyleSheet } from "react-native";

interface SkeletonLoaderProps {
  /** Number of skeleton rows to display */
  rows?: number;
  /** Variant: "card" for mobile cards, "table" for desktop rows */
  variant?: "card" | "table";
}

function ShimmerBlock({ width, height, borderRadius = 8 }: { width: number | string; height: number; borderRadius?: number }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.25],
  });

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "#F3F4F6",
          opacity,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <View
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: index % 2 === 0 ? "#E5E7EB" : "#F3F4F6",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Header row */}
      <View className="flex-row items-center gap-3 mb-3">
        <ShimmerBlock width={40} height={40} borderRadius={12} />
        <View className="flex-1 gap-2">
          <ShimmerBlock width="70%" height={14} borderRadius={6} />
          <ShimmerBlock width="45%" height={10} borderRadius={4} />
        </View>
        <ShimmerBlock width={60} height={22} borderRadius={10} />
      </View>
      {/* Field rows */}
      <View className="bg-gray-50/50 rounded-xl p-3 gap-2.5">
        <View className="flex-row justify-between">
          <ShimmerBlock width={60} height={10} borderRadius={4} />
          <ShimmerBlock width={90} height={10} borderRadius={4} />
        </View>
        <View className="flex-row justify-between">
          <ShimmerBlock width={50} height={10} borderRadius={4} />
          <ShimmerBlock width={110} height={10} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

function SkeletonTableRow({ index }: { index: number }) {
  return (
    <View
      className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
      }`}
    >
      <View className="w-14">
        <ShimmerBlock width={30} height={12} borderRadius={4} />
      </View>
      <View className="flex-1 flex-row items-center gap-3">
        <ShimmerBlock width={36} height={36} borderRadius={10} />
        <View className="gap-1.5 flex-1">
          <ShimmerBlock width="65%" height={13} borderRadius={5} />
          <ShimmerBlock width="40%" height={10} borderRadius={4} />
        </View>
      </View>
      <View className="w-[120px] items-center">
        <ShimmerBlock width={70} height={12} borderRadius={4} />
      </View>
      <View className="w-[100px] items-end">
        <ShimmerBlock width={65} height={24} borderRadius={8} />
      </View>
    </View>
  );
}

export function SkeletonLoader({ rows = 4, variant = "card" }: SkeletonLoaderProps) {
  if (variant === "table") {
    return (
      <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Table header skeleton */}
        <View className="flex-row items-center px-5 py-4 bg-gray-50 border-b border-gray-100">
          <View className="w-14">
            <ShimmerBlock width={30} height={10} borderRadius={4} />
          </View>
          <View className="flex-1">
            <ShimmerBlock width={120} height={10} borderRadius={4} />
          </View>
          <View className="w-[120px] items-center">
            <ShimmerBlock width={80} height={10} borderRadius={4} />
          </View>
          <View className="w-[100px] items-end">
            <ShimmerBlock width={60} height={10} borderRadius={4} />
          </View>
        </View>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} index={i} />
        ))}
      </View>
    );
  }

  return (
    <View>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  );
}
