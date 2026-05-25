import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiNoticeInsertNotice, 
  usePutApiNoticeUpdateNotice, 
  useGetApiNoticeGetNoticeByIdId 
} from "@/api/generated/notice/notice";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";

export default function NoticeFormScreen() {
  const { id } = useLocalSearchParams();
  const noticeID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!noticeID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeType, setNoticeType] = useState("General");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetAudience, setTargetAudience] = useState("Everyone");
  const [noticeDescription, setNoticeDescription] = useState("");

  const insertNotice = usePostApiNoticeInsertNotice();
  const updateNotice = usePutApiNoticeUpdateNotice();
  const { data: noticeResponse, isLoading: loadingNotice } = useGetApiNoticeGetNoticeByIdId(noticeID as number, {
    query: { enabled: isEditing }
  });

  useEffect(() => {
    if (noticeResponse?.data) {
      const n = parseApiData(noticeResponse.data) as any;
      setNoticeTitle(n.noticeTitle || "");
      setNoticeType(n.noticeType || "General");
      setNoticeDate(n.noticeDate ? String(n.noticeDate).slice(0, 10) : "");
      setTargetAudience(n.targetAudience || "Everyone");
      setNoticeDescription(n.noticeDescription || "");
    }
  }, [noticeResponse]);

  const handleSubmit = async () => {
    if (!noticeTitle || !noticeDescription) {
      Alert.alert("Missing Fields", "Please complete title and description.");
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
      if (isEditing) {
        await updateNotice.mutateAsync({
          data: { ...payload, noticeID: noticeID as number, updatedBy: parseInt(userData?.id || "0") }
        });
        Alert.alert("Success", "Notice updated successfully!");
      } else {
        await insertNotice.mutateAsync({
          data: payload
        });
        Alert.alert("Success", "Notice published successfully!");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "publish"} notice`);
    }
  };

  if (loadingNotice) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching notice details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Notice" : "New Notice"}
      subtitle={isEditing ? "Modify announcement details" : "Publish a new announcement to the school"}
      onBack={() => router.back()}
      keyboard
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
            <AppIcon name="notices" size={22} color={Colors.primary} active />
            <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Announcement Details</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text style={styles.label}>Notice Title *</Text>
              <TextInput
                value={noticeTitle}
                onChangeText={setNoticeTitle}
                placeholder="e.g. Annual Sports Day 2026"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>Type</Text>
                <TextInput
                  value={noticeType}
                  onChangeText={setNoticeType}
                  placeholder="General"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Date</Text>
                <TextInput
                  value={noticeDate}
                  onChangeText={setNoticeDate}
                  placeholder="YYYY-MM-DD"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Target Audience</Text>
              <View className="flex-row flex-wrap gap-2">
                {["Everyone", "Students", "Teachers", "Parents"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTargetAudience(t)}
                    className={`px-4 py-2 rounded-lg border ${targetAudience === t ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    <Text className={`text-xs font-bold ${targetAudience === t ? "text-blue-700" : "text-gray-500"}`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Notice Description *</Text>
              <TextInput
                value={noticeDescription}
                onChangeText={setNoticeDescription}
                placeholder="Write the full announcement content here..."
                multiline
                numberOfLines={6}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800"
                style={{ minHeight: 120, textAlignVertical: "top" }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-[52px] rounded-xl items-center justify-center shadow-lg flex-row gap-2 mt-8"
            style={{ backgroundColor: Colors.primary }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update Notice" : "Publish Notice"}
              </Text>
            )}
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
