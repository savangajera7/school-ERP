import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { useProfilePhotoUpload } from "@/hooks/useProfilePhotoUpload";
import { SchoolTheme } from "@/constants/theme";

type Props = {
  name?: string;
  avatarUri?: string | null;
  initials: string;
  size?: number;
  light?: boolean;
};

export function ProfileAvatarPicker({
  name,
  avatarUri,
  initials,
  size = 72,
  light = true,
}: Props) {
  const { pickAndUpload, uploading } = useProfilePhotoUpload();
  const ring = light ? styles.ringLight : styles.ringDark;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={pickAndUpload}
        disabled={uploading}
        activeOpacity={0.85}
        style={[styles.avatarBtn, { width: size, height: size, borderRadius: size * 0.28 }]}
      >
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) * 0.26 }}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size - 4, height: size - 4, borderRadius: (size - 4) * 0.26 },
            ]}
          >
            <Text style={[styles.initials, { fontSize: size * 0.32 }]}>{initials}</Text>
          </View>
        )}
        {uploading ? (
          <View style={[styles.overlay, { borderRadius: size * 0.28 }]}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        ) : (
          <View style={styles.cameraBadge}>
            <AppIcon name="add" size={14} color="#fff" active />
          </View>
        )}
      </TouchableOpacity>
      {name ? (
        <View style={styles.nameCol}>
          <Text style={[styles.name, light && styles.nameLight]} numberOfLines={2}>
            {name}
          </Text>
          <Text style={[styles.hint, light && styles.hintLight]}>Tap photo to change</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarBtn: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringLight: {},
  ringDark: { borderColor: SchoolTheme.border },
  placeholder: {
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontWeight: "900", color: "#fff" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: SchoolTheme.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameCol: { flex: 1 },
  name: { fontSize: 18, fontWeight: "900", color: SchoolTheme.text },
  nameLight: { color: "#fff" },
  hint: { fontSize: 11, fontWeight: "600", color: SchoolTheme.textSecondary, marginTop: 4 },
  hintLight: { color: "rgba(255,255,255,0.7)" },
});
