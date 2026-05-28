import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiNoticeAdd, 
  usePutApiNoticeUpdate, 
} from "@/api/generated/8-notice/8-notice";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";

export default function NoticeFormScreen() {
  const { id } = useLocalSearchParams();
  const noticeID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!noticeID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeType, setNoticeType] = useState("School Notice");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [noticeDescription, setNoticeDescription] = useState("");
  const [classIDs, setClassIDs] = useState("");

  const insertNotice = usePostApiNoticeAdd();
  const updateNotice = usePutApiNoticeUpdate();
  const noticeResponse: any = { data: null };
  const loadingNotice = false;

  useEffect(() => {
    if (noticeResponse?.data) {
      const n = parseApiData(noticeResponse.data) as any;
      setNoticeTitle(n.noticeTitle || "");
      setNoticeType(n.noticeType || "School Notice");
      setNoticeDate(n.startDate ? String(n.startDate).slice(0, 10) : "");
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
      startDate: noticeDate,
      endDate: noticeDate,
      noticeDescription,
      classIDs: noticeType === "Class Notice" && classIDs ? classIDs.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
      addedBy: parseInt(userData?.id || "0"),
      schoolID: parseInt(userData?.schoolID || "1"),
      assignedByRole: userData?.role || "Admin",
      assignedByName: userData?.name || "Admin",
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateNotice.mutateAsync({
          data: { ...payload, updatedBy: parseInt(userData?.id || "0") } as any
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
      flatHeader
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
                <PremiumDatePicker
                  label="Date"
                  value={noticeDate}
                  onChange={setNoticeDate}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Notice Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {["School Notice", "Student Notice", "Teacher Notice", "Class Notice"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNoticeType(t)}
                    className={`px-4 py-2 rounded-lg border ${noticeType === t ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    <Text className={`text-xs font-bold ${noticeType === t ? "text-blue-700" : "text-gray-500"}`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {noticeType === "Class Notice" && (
              <View>
                <Text style={styles.label}>Target Class IDs (comma-separated) *</Text>
                <TextInput
                  value={classIDs}
                  onChangeText={setClassIDs}
                  placeholder="e.g. 10, 12"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
            )}

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
