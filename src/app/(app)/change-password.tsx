import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import {
  usePostApiChangePasswordParent,
  usePostApiChangePasswordStudent,
  usePostApiChangePasswordTeacher,
} from "@/api/generated/4-change-password/4-change-password";
import { getApiErrorMessage } from "@/utils/recordHelpers";

export default function ChangePasswordScreen() {
  const { role, userData } = useAuthStore();
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const parentMut = usePostApiChangePasswordParent();
  const studentMut = usePostApiChangePasswordStudent();
  const teacherMut = usePostApiChangePasswordTeacher();

  const userId = parseInt(userData?.id ?? "0", 10) || 0;

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword) {
      showToast("Fill all password fields.", "error");
      return;
    }
    if (newPassword !== confirm) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 4) {
      showToast("Password must be at least 4 characters.", "error");
      return;
    }

    try {
      if (role === "parent") {
        await parentMut.mutateAsync({
          data: { parentID: userId, oldPassword, newPassword },
        });
      } else if (role === "student") {
        await studentMut.mutateAsync({
          data: { studentID: userId, oldPassword, newPassword },
        });
      } else if (role === "teacher") {
        await teacherMut.mutateAsync({
          data: { teacherID: userId, oldPassword, newPassword },
        });
      } else {
        showToast("Change password is available for parent, student, and teacher accounts.", "info");
        return;
      }
      showToast("Password updated.", "success");
      router.back();
    } catch (e) {
      showToast(getApiErrorMessage(e, "Failed to change password"), "error");
    }
  };

  const loading =
    parentMut.isPending || studentMut.isPending || teacherMut.isPending;

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader title="Change password" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text className="text-sm text-gray-500">
          Update your account password. Admin accounts should reset via the web portal or IT support.
        </Text>
        <TextInput
          placeholder="Current password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
          className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
        />
        <TextInput
          placeholder="New password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
        />
        <TextInput
          placeholder="Confirm new password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
        />
        <Button label="Update password" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}
