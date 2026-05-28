import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/authStore";
import { putApiUserUpdateUser } from "@/api/generated/user/user";
import { uploadProfileImage } from "@/services/upload/uploadService";

export function useProfilePhotoUpload() {
  const { userData, setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndUpload = useCallback(async () => {
    setError(null);

    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to change your profile picture."
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    let name = uri.split("/").pop() || `profile-${Date.now()}.jpg`;
    if (!name.match(/\.(jpg|jpeg|png|gif)$/i)) {
      name = `${name}.jpg`;
    }
    const type = asset.mimeType || "image/jpeg";

    const userId = Number(userData?.id);
    if (!userId) {
      setError("User session not found.");
      return;
    }

    setUploading(true);
    try {
      const photoUrl = await uploadProfileImage({ uri, name, type });

      await putApiUserUpdateUser({
        userID: userId,
        roleID: userData?.roleID,
        fullName: userData?.name,
        email: userData?.email,
        mobileNo: userData?.mobile,
        profilePhoto: photoUrl,
        updatedBy: userId,
      });

      if (userData) {
        setUser({ ...userData, avatar: photoUrl });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile photo";
      setError(msg);
      Alert.alert("Upload failed", msg);
    } finally {
      setUploading(false);
    }
  }, [userData, setUser]);

  return { pickAndUpload, uploading, error };
}
