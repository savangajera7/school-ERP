import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { usePostApiNoticeInsertNotice } from "@/api/generated/notice/notice";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

export default function NoticeComposeScreen() {
  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const insertMutation = usePostApiNoticeInsertNotice();

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDescription, setNoticeDescription] = useState("");
  const [noticeFor, setNoticeFor] = useState<"School" | "Class">("School");

  const handlePublish = async () => {
    if (!noticeTitle.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    try {
      await insertMutation.mutateAsync({
        data: {
          noticeTitle,
          noticeDescription,
          noticeFor,
          addedBy: parseInt(userData?.id ?? "0", 10) || 0,
        },
      });
      showToast("Notice published.", "success");
      router.replace("/(app)/notices");
    } catch {
      showToast("Failed to publish notice.", "error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader title="Publish Notice" subtitle="School or class circular" onBack={() => router.back()} />
      <ScrollView className="p-6">
        <View className="flex-row gap-2 mb-4">
          {(["School", "Class"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setNoticeFor(t)}
              className={`px-4 py-2 rounded-xl border ${noticeFor === t ? "bg-primary border-primary" : "border-gray-200"}`}
            >
              <Text className={noticeFor === t ? "text-white font-bold" : "text-gray-600"}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          value={noticeTitle}
          onChangeText={setNoticeTitle}
          placeholder="Notice title"
          className="border border-gray-200 rounded-xl px-4 py-3 mb-4"
        />
        <TextInput
          value={noticeDescription}
          onChangeText={setNoticeDescription}
          placeholder="Notice description"
          multiline
          numberOfLines={6}
          className="border border-gray-200 rounded-xl px-4 py-3 mb-6 min-h-[120px]"
        />
        <Button label="Publish" onPress={handlePublish} loading={insertMutation.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
