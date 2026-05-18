import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  style,
  ...props
}) => {
  const { isMobile, isTablet } = useBreakpoint();

  const cardStyle: ViewStyle = isMobile
    ? {
        backgroundColor: "transparent",
        borderRadius: 0,
        paddingHorizontal: 0,
        paddingVertical: 12,
        width: "100%",
        maxWidth: "100%",
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      }
    : isTablet
    ? {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        maxWidth: 520,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
      }
    : {
        // Desktop
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 40,
        width: "100%",
        maxWidth: 480,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 8,
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
