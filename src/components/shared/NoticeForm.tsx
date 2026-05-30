import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/icons/AppIcon";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { usePostApiNoticeAdd } from "@/api/generated/8-notice/8-notice";
import { usePostApiNotificationInsertNotification } from "@/api/generated/15-notifications-parent-student-inbox-admin-send/15-notifications-parent-student-inbox-admin-send";
import { useDialog } from "@/components/ui/AppDialog";

export interface NoticeFormProps {
  /** Target audience options (e.g. ["Everyone", "Students", "Teachers", "Parents"]) */
  targets: string[];
  /** Default target selection (e.g. "Everyone") */
  defaultTarget: string;
  /** Fallback role ID if not found in auth store */
  defaultRoleId: number;
  /** Callback on successful notice insertion */
  onSuccess: () => void;
}

/**
 * Reusable compose form for publishing new notices and automatically dispatching notifications.
 * Eliminates 80+ lines of duplicate inline JSX between Admin and Teacher roles.
 */
export function NoticeForm({
  targets,
  defaultTarget,
  defaultRoleId,
  onSuccess,
}: NoticeFormProps) {
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { alert } = useDialog();

  // Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeType, setNoticeType] = useState("General");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetAudience, setTargetAudience] = useState(defaultTarget);
  const [noticeDescription, setNoticeDescription] = useState("");

  const insertNotice = usePostApiNoticeAdd();
  const insertNotification = usePostApiNotificationInsertNotification();

  const handleSubmit = async () => {
    if (!noticeTitle || !noticeDescription) {
      await alert("Missing Fields", "Please complete title and description.", "warning");
      return;
    }

    const payload = {
      noticeTitle,
      noticeType,
      noticeDate,
      targetAudience,
      noticeDescription,
      isActive: true,
      createdBy: parseInt(userData?.id || "0"),
    };

    try {
      setLoading(true);
      await insertNotice.mutateAsync({ data: payload });

      // Automatically send notification when notice is published
      await insertNotification.mutateAsync({
        data: {
          title: noticeTitle,
          message: noticeDescription,
          notificationType: noticeType,
          deviceType: "All",
          isSent: false,
          createdBy: parseInt(userData?.id || "0"),
          roleID: userData?.roleId || defaultRoleId,
          userID: parseInt(userData?.id || "0"),
        },
      });

      await alert("Success", "Notice published and notification sent!", "success");
      setLoading(false);
      
      // Reset form
      setNoticeTitle("");
      setNoticeType("General");
      setNoticeDate(new Date().toISOString().split("T")[0]);
      setTargetAudience(defaultTarget);
      setNoticeDescription("");
      
      onSuccess();
    } catch (error: any) {
      setLoading(false);
      await alert("Error", error.message || "Failed to publish notice", "error");
    }
  };

  return (
    <Card className="p-5 mb-4">
      <View className="flex-row items-center gap-3 mb-4 border-b border-gray-100 dark:border-slate-700 pb-3">
        <AppIcon name="notices" size={20} color={Colors.primary} active />
        <Text className="text-[14px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-wide">
          New Notice
        </Text>
      </View>

      <View className="gap-3">
        <View>
          <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">
            Notice Title *
          </Text>
          <TextInput
            value={noticeTitle}
            onChangeText={setNoticeTitle}
            placeholder="e.g. Notice / Event Title"
            className="h-[44px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">
              Type
            </Text>
            <TextInput
              value={noticeType}
              onChangeText={setNoticeType}
              placeholder="General"
              className="h-[44px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">
              Date
            </Text>
            <TextInput
              value={noticeDate}
              onChangeText={setNoticeDate}
              placeholder="YYYY-MM-DD"
              className="h-[44px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
            />
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">
            Target Audience
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {targets.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTargetAudience(t)}
                className={`px-3 py-1.5 rounded-lg border ${
                  targetAudience === t ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    targetAudience === t ? "text-blue-700" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">
            Notice Description *
          </Text>
          <TextInput
            value={noticeDescription}
            onChangeText={setNoticeDescription}
            placeholder="Write the full announcement content here..."
            multiline
            numberOfLines={4}
            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 dark:text-slate-200"
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="h-[48px] rounded-xl items-center justify-center shadow-lg"
          style={{ backgroundColor: Colors.primary }}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-black text-xs uppercase tracking-widest">
              Publish Notice
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );
}
