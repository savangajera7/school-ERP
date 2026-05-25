import React from "react";
import { View, Text, Image, StyleSheet, Platform } from "react-native";
import { SchoolTheme } from "@/constants/theme";
import { SCHOOL_LOGO } from "@/constants/branding";

type Props = {
  size?: "sm" | "md" | "lg";
  /** Side-by-side (header) or centered stack (login / splash) */
  variant?: "horizontal" | "stacked";
  showTagline?: boolean;
  light?: boolean;
  title?: string;
  tagline?: string;
};

const SIZES = {
  sm: {
    logo: 44,
    title: 14,
    tag: 9,
    stackedLogo: 72,
    stackedTitle: 18,
    stackedTag: 10,
  },
  md: {
    logo: 52,
    title: 16,
    tag: 10,
    stackedLogo: 100,
    stackedTitle: 22,
    stackedTag: 11,
  },
  lg: {
    logo: 64,
    title: 20,
    tag: 11,
    stackedLogo: 148,
    stackedTitle: 30,
    stackedTag: 12,
  },
};

function BrandTextBlock({
  title,
  tagline,
  showTagline,
  titleSize,
  tagSize,
  titleColor,
  tagColor,
  stacked,
}: {
  title: string;
  tagline: string;
  showTagline: boolean;
  titleSize: number;
  tagSize: number;
  titleColor: string;
  tagColor: string;
  stacked: boolean;
}) {
  return (
    <View style={[styles.textBlock, stacked && styles.textBlockStacked]}>
      <Text
        style={[
          styles.brandTitle,
          { fontSize: titleSize, color: titleColor },
          stacked && styles.brandTitleStacked,
        ]}
      >
        {title}
      </Text>
      {showTagline ? (
        <Text
          style={[
            styles.brandTagline,
            { fontSize: tagSize, color: tagColor },
            stacked ? styles.brandTaglineStacked : styles.brandTaglineInline,
          ]}
        >
          {tagline}
        </Text>
      ) : null}
    </View>
  );
}

export function AppBrandLogo({
  size = "md",
  variant = "horizontal",
  showTagline = true,
  light = false,
  title = "Little Angel's",
  tagline = "Smart School Management System",
}: Props) {
  const s = SIZES[size];
  const titleColor = light ? "#fff" : SchoolTheme.text;
  const tagColor = light ? SchoolTheme.accent : SchoolTheme.primary;

  if (variant === "stacked") {
    return (
      <View style={styles.stacked}>
        <View
          style={[
            styles.stackedLogoRing,
            {
              width: s.stackedLogo + 16,
              height: s.stackedLogo + 16,
              borderRadius: (s.stackedLogo + 16) / 2,
            },
          ]}
        >
          <Image
            source={SCHOOL_LOGO}
            style={{
              width: s.stackedLogo,
              height: s.stackedLogo,
              borderRadius: s.stackedLogo / 2,
            }}
            resizeMode="cover"
          />
        </View>
        <BrandTextBlock
          title={title}
          tagline={tagline}
          showTagline={showTagline}
          titleSize={s.stackedTitle}
          tagSize={s.stackedTag}
          titleColor={titleColor}
          tagColor={tagColor}
          stacked
        />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Image
        source={SCHOOL_LOGO}
        style={{
          width: s.logo,
          height: s.logo,
          borderRadius: s.logo / 2,
        }}
        resizeMode="cover"
      />
      <BrandTextBlock
        title={title}
        tagline={tagline}
        showTagline={showTagline}
        titleSize={s.title}
        tagSize={s.tag}
        titleColor={titleColor}
        tagColor={tagColor}
        stacked={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  stacked: { alignItems: "center", width: "100%" },
  stackedLogoRing: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 12px 40px rgba(0,0,0,0.2)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 14,
        }),
  },
  textBlock: {
    flexShrink: 1,
    justifyContent: "center",
  },
  textBlockStacked: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    paddingHorizontal: 12,
  },
  brandTitle: {
    fontWeight: "900",
    letterSpacing: 0.2,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  brandTitleStacked: {
    textAlign: "center",
  },
  brandTagline: {
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandTaglineStacked: {
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 1.1,
    lineHeight: 18,
    maxWidth: 280,
  },
  brandTaglineInline: {
    marginTop: 4,
    textAlign: "left",
  },
});
