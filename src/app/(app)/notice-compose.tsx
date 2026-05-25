import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard, PremiumTabSwitcher } from "@/components/ui/premium";
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
    <PremiumScreenLayout
      title="Publish Notice"
      subtitle="School or class circular"
      onBack={() => router.back()}
      keyboard
      headerSlot={
        <PremiumTabSwitcher
          tabs={[
            { key: "School", label: "School" },
            { key: "Class", label: "Class" },
          ]}
          active={noticeFor}
          onChange={(k) => setNoticeFor(k as "School" | "Class")}
        />
      }
    >
      <PremiumCard noAccent style={{ padding: 20, gap: 12 }}>
        <TextInput
          value={noticeTitle}
          onChangeText={setNoticeTitle}
          placeholder="Notice title"
          className="border border-gray-200 rounded-xl px-4 py-3"
        />
        <TextInput
          value={noticeDescription}
          onChangeText={setNoticeDescription}
          placeholder="Notice description"
          multiline
          numberOfLines={6}
          className="border border-gray-200 rounded-xl px-4 py-3 min-h-[120px]"
        />
        <Button label="Publish" onPress={handlePublish} loading={insertMutation.isPending} />
      </PremiumCard>
    </PremiumScreenLayout>
  );
}
