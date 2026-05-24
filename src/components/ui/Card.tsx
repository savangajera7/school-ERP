import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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
  const { isMobile, isTablet } = useBreakpoint();

  const cardStyle: ViewStyle = isMobile
    ? {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: noPadding ? 0 : 16,
        width: "100%",
        maxWidth: "100%",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
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
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 4,
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
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 40,
        elevation: 6,
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
