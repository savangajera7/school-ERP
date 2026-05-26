import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNoticeGetNoticeList, usePostApiNoticeInsertNotice } from "@/api/generated/notice/notice";
import { usePostApiNotificationInsertNotification } from "@/api/generated/notification/notification";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";

export default function TeacherNoticeScreen() {
  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeType, setNoticeType] = useState("General");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetAudience, setTargetAudience] = useState("Class");
  const [noticeDescription, setNoticeDescription] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiNoticeGetNoticeList();
  const insertNotice = usePostApiNoticeInsertNotice();
  const insertNotification = usePostApiNotificationInsertNotification();

  const notices = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredNotices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return notices;
    return notices.filter((n) => {
      const title = (n.noticeTitle || "").toLowerCase();
      return (
        title.includes(q) ||
        (n.noticeType || "").toLowerCase().includes(q)
      );
    });
  }, [notices, searchQuery]);

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
          roleID: userData?.roleId || 3,
          userID: parseInt(userData?.id || "0"),
        },
      });
      
      Alert.alert("Success", "Notice published and notification sent!");
      setLoading(false);
      // Reset form
      setNoticeTitle("");
      setNoticeType("General");
      setNoticeDate(new Date().toISOString().split("T")[0]);
      setTargetAudience("Class");
      setNoticeDescription("");
      setShowForm(false);
      refetch();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to publish notice");
    }
  };

  const renderNoticeItem = ({ item }: { item: any }) => {
    return (
      <MobileDataCard
        title={item.noticeTitle || "Untitled Notice"}
        subtitle={item.noticeType || "General Notice"}
        accentColor={Colors.primary}
        icon={<IconCircle name="notices" size={44} iconSize={22} />}
        fields={[
          { label: "Date", value: formatDisplayDate(item.noticeDate) },
          { label: "Target", value: item.targetAudience || "Everyone" },
          { label: "Status", value: item.isActive ? "Active" : "Expired", highlight: item.isActive ? "success" : "muted" },
        ]}
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Notices"
      subtitle="Class announcements"
      scrollable={false}
      flatHeader
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Toggle Form Button */}
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="bg-[#134A8C] rounded-xl p-4 mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <AppIcon name="compose" size={20} color="white" />
            <Text className="text-white font-bold text-sm">
              {showForm ? "Cancel" : "+ Send New Notice"}
            </Text>
          </View>
          <AppIcon name={showForm ? "chevronRight" : "chevronDown"} size={18} color="white" />
        </TouchableOpacity>

        {/* Notice Form */}
        {showForm && (
          <Card className="p-5 mb-4">
            <View className="flex-row items-center gap-3 mb-4 border-b border-gray-100 pb-3">
              <AppIcon name="notices" size={20} color={Colors.primary} active />
              <Text className="text-[14px] font-black text-gray-900 uppercase tracking-wide">New Notice</Text>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Notice Title *</Text>
                <TextInput
                  value={noticeTitle}
                  onChangeText={setNoticeTitle}
                  placeholder="e.g. Class Test Tomorrow"
                  className="h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Type</Text>
                  <TextInput
                    value={noticeType}
                    onChangeText={setNoticeType}
                    placeholder="General"
                    className="h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Date</Text>
                  <TextInput
                    value={noticeDate}
                    onChangeText={setNoticeDate}
                    placeholder="YYYY-MM-DD"
                    className="h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Target Audience</Text>
                <View className="flex-row flex-wrap gap-2">
                  {["Class", "Students", "Parents"].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTargetAudience(t)}
                      className={`px-3 py-1.5 rounded-lg border ${targetAudience === t ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                    >
                      <Text className={`text-[11px] font-bold ${targetAudience === t ? "text-blue-700" : "text-gray-500"}`}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Notice Description *</Text>
                <TextInput
                  value={noticeDescription}
                  onChangeText={setNoticeDescription}
                  placeholder="Write the full announcement content here..."
                  multiline
                  numberOfLines={4}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800"
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
        )}

        {/* Search */}
        <PremiumSearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notices..."
          onClear={() => setSearchQuery("")}
        />

        {/* Notices List */}
        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : "Could not load notices"}
          />
        ) : (
          <FlatList
            data={filteredNotices}
            renderItem={renderNoticeItem}
            keyExtractor={(item) => String(item.noticeID)}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <EmptyState
                icon="notices"
                title="No notices found"
                message={searchQuery ? "Try a different search" : "No class announcements yet"}
              />
            }
            onRefresh={refetch}
            refreshing={isLoading}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </PremiumScreenLayout>
  );
}
