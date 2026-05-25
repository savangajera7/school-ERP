import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  type AppIconName,
  resolveIconName,
  QUICK_ACTION_STYLES,
} from "@/constants/appIcons";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  active?: boolean;
  style?: ViewStyle;
};

export function AppIcon({ name, size = 22, color, active = false, style }: Props) {
  return (
    <Ionicons
      name={resolveIconName(name, active)}
      size={size}
      color={color ?? SchoolTheme.primary}
      style={style}
    />
  );
}

type CircleProps = {
  name: AppIconName;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  active?: boolean;
  bordered?: boolean;
};

/** Premium icon inside a soft rounded tile */
export function IconCircle({
  name,
  size = 44,
  iconSize,
  color,
  backgroundColor,
  active = false,
  bordered = true,
}: CircleProps) {
  const preset = QUICK_ACTION_STYLES[name];
  const bg = backgroundColor ?? preset?.iconBg ?? `${SchoolTheme.primary}18`;
  const ic = color ?? preset?.iconColor ?? SchoolTheme.primary;
  const glyph = iconSize ?? Math.round(size * 0.48);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: bg,
        },
        bordered && styles.bordered,
      ]}
    >
      <AppIcon name={name} size={glyph} color={ic} active={active} />
    </View>
  );
}

type TileProps = {
  name: AppIconName;
  label?: string;
  onPress?: () => void;
  size?: number;
  active?: boolean;
};

export function IconTile({ name, size = 48, active }: TileProps) {
  const preset = QUICK_ACTION_STYLES[name];
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: preset?.iconBg ?? "#E5E7EB",
        },
      ]}
    >
      <AppIcon
        name={name}
        size={Math.round(size * 0.46)}
        color={preset?.iconColor ?? SchoolTheme.primary}
        active={active}
      />
    </View>
  );
}

export function GenderIcon({
  gender,
  size = 22,
  color = SchoolTheme.primary,
}: {
  gender?: string | null;
  size?: number;
  color?: string;
}) {
  return (
    <AppIcon
      name={gender === "Female" ? "female" : "male"}
      size={size}
      color={color}
      active
    />
  );
}

export function SubjectSlotIcon({
  subject,
  size = 20,
}: {
  subject?: string | null;
  size?: number;
}) {
  const isLunch = subject === "Lunch Break";
  return (
    <AppIcon
      name={isLunch ? "lunch" : "subjects"}
      size={size}
      color={isLunch ? "#C2410C" : SchoolTheme.primary}
      active
    />
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  bordered: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
  },
});
