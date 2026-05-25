import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNoticeGetNoticeList, useDeleteApiNoticeDeleteNotice } from "@/api/generated/notice/notice";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function AdminNoticesManagementScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiNoticeGetNoticeList();
  const deleteNotice = useDeleteApiNoticeDeleteNotice();

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

  const handleDelete = (notice: any) => {
    Alert.alert(
      "Delete Notice",
      `Are you sure you want to remove "${notice.noticeTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotice.mutateAsync({ 
                data: { noticeID: notice.noticeID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete notice");
            }
          }
        }
      ]
    );
  };

  const renderNoticeItem = ({ item }: { item: any }) => {
    return (
      <MobileDataCard
        title={item.noticeTitle || "Untitled Notice"}
        subtitle={item.noticeType || "General Notice"}
        accentColor={Colors.primary}
        icon={<IconCircle name="notices" size={44} iconSize={22} />}
        fields={[
          { label: "Date", value: item.noticeDate ? String(item.noticeDate).slice(0, 10) : "N/A" },
          { label: "Target", value: item.targetAudience || "Everyone" },
          { label: "Status", value: item.isActive ? "Active" : "Expired", highlight: item.isActive ? "success" : "default" },
        ]}
        actions={
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/notice-form?id=${item.noticeID}`)}
              className="bg-blue-50 p-2 rounded-lg"
            >
              <AppIcon name="edit" size={18} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDelete(item)}
              className="bg-red-50 p-2 rounded-lg"
            >
              <AppIcon name="delete" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Notices"
      subtitle="Publish school announcements"
      scrollable={false}
      showTopBar
      rightAction={
        <HeaderActionButton
          label="+ Publish Notice"
          shortLabel="+ Add"
          onPress={() => router.push("/(admin)/notice-form")}
        />
      }
    >
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search notices..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load notices"}
          onRetry={refetch}
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
              message={searchQuery ? "Try a different search" : "No announcements published yet"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </PremiumScreenLayout>
  );
}
