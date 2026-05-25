import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** If true, don't apply any default padding (used for table cards) */
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  style,
  noPadding = false,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const cardStyle: ViewStyle = isMobile
    ? {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: noPadding ? 0 : 16,
        width: "100%",
        maxWidth: "100%",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        boxShadow: "0px 2px 12px rgba(0,0,0,0.04)",
      }
    : isTablet
    ? {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: noPadding ? 0 : 24,
        width: "100%",
        maxWidth: "100%",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        boxShadow: "0px 4px 24px rgba(0,0,0,0.06)",
      }
    : {
        // Desktop
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: noPadding ? 0 : 32,
        width: "100%",
        maxWidth: "100%",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        boxShadow: "0px 6px 40px rgba(0,0,0,0.08)",
      };

  return (
    <View
      style={[cardStyle, style]}
      className={`${className || ""}`}
      {...props}
    >
      {children}
    </View>
  );
};
