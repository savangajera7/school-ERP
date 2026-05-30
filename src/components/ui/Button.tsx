import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  type TouchableOpacityProps,
} from "react-native";
import { Colors } from "@/constants/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "children"> {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; loaderColor: string }
> = {
  primary: {
    container: "bg-primary active:bg-primaryDark border border-transparent",
    text: "text-white font-semibold",
    loaderColor: "#FFFFFF",
  },
  secondary: {
    container: "bg-[#EFF6FF] border border-[#BFDBFE] active:bg-[#DBEAFE]",
    text: "text-primary font-semibold",
    loaderColor: Colors.primary,
  },
  outline: {
    container: "bg-transparent border-[1.5px] border-primary active:bg-primaryXLight",
    text: "text-primary font-semibold",
    loaderColor: Colors.primary,
  },
  ghost: {
    container: "bg-transparent border border-transparent active:bg-gray-100 dark:bg-slate-700",
    text: "text-primary font-semibold",
    loaderColor: Colors.primary,
  },
};

const sizeStyles: Record<
  ButtonSize,
  { container: string; text: string }
> = {
  sm: {
    container: "h-[36px] px-4",
    text: "text-[13px]",
  },
  md: {
    container: "h-[48px] px-6",
    text: "text-[15px]",
  },
  lg: {
    container: "h-[56px] px-8",
    text: "text-[17px]",
  },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  loading = false,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = true,
  className,
  ...props
}) => {
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  const hoverClass = Platform.OS === 'web' ? 'hover:opacity-90 transition-all cursor-pointer' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`
        rounded-xl items-center justify-center flex-row
        ${styles.container}
        ${sizeStyle.container}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${hoverClass}
        ${className || ""}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.loaderColor} />
      ) : (
        <Text className={`font-semibold ${sizeStyle.text} ${styles.text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
