import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Colors } from "@/constants/colors";
import {
  installAndroidApk,
  type DownloadManifest,
} from "@/services/updates/appUpdateService";

type Props = {
  visible: boolean;
  manifest: DownloadManifest | null;
  apkUrl: string | null;
  installedVersion: string;
  onDismiss: () => void;
};

export function AppUpdateModal({
  visible,
  manifest,
  apkUrl,
  installedVersion,
  onDismiss,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remoteVersion = manifest?.version ?? "?";

  const handleUpdate = async () => {
    if (!apkUrl) return;
    setError(null);
    setLoading(true);
    try {
      await installAndroidApk(apkUrl);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not start update. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS !== "android") return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Update available</Text>
          <Text style={styles.body}>
            A new version of School ERP is ready ({remoteVersion}). You are on{" "}
            {installedVersion}.
          </Text>
          <Text style={styles.hint}>
            Tap Update to download and install. If Play Protect appears, choose
            Install anyway — this app is distributed directly by your school.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleUpdate}
            disabled={loading || !apkUrl}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Update now</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onDismiss}>
            <Text style={styles.secondaryText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 8,
  },
  body: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 12,
    lineHeight: 18,
  },
  error: { color: Colors.error, marginTop: 8, fontSize: 13 },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabled: { opacity: 0.7 },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { marginTop: 12, alignItems: "center", padding: 8 },
  secondaryText: { color: Colors.textSecondary, fontWeight: "600" },
});
