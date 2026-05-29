import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNoticeGet, usePostApiNoticeDelete } from "@/api/generated/8-notice/8-notice";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { NoticeForm } from "@/components/shared";

export default function AdminNoticesManagementScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { confirm, alert } = useDialog();

  const { data, isLoading, isError, error, refetch } = useGetApiNoticeGet();
  const deleteNotice = usePostApiNoticeDelete();

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

  const handleDelete = async (notice: any) => {
    const ok = await confirm(
      "Delete Notice",
      `Are you sure you want to remove "${notice.noticeTitle}"?`,
      { confirmLabel: "Delete", destructive: true }
    );
    if (!ok) return;
    try {
      await deleteNotice.mutateAsync({ data: { noticeID: notice.noticeID } });
      refetch();
    } catch (err: any) {
      await alert("Error", err.message || "Failed to delete notice", "error");
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

        {/* Reusable Compose Form */}
        {showForm && (
          <NoticeForm
            targets={["Everyone", "Students", "Teachers", "Parents"]}
            defaultTarget="Everyone"
            defaultRoleId={2}
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
          />
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
                message={searchQuery ? "Try a different search" : "No announcements published yet"}
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
