import React, { useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { useToast } from "@/components/ui/Toast";
import { router, useFocusEffect } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNoticeGet, usePostApiNoticeDelete } from "@/api/generated/8-notice/8-notice";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumSearchField } from "@/components/ui/premium";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { NoticeForm } from "@/components/shared";
import { premiumCardShadow } from "@/constants/premiumStyles";

export default function AdminNoticesManagementScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { confirm, alert } = useDialog();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useGetApiNoticeGet();
  const deleteNotice = usePostApiNoticeDelete();

  // Force refetch on focus to ensure latest data
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
      showToast("Notice deleted successfully", "success");
      refetch();
    } catch (err: any) {
      await alert("Error", err.message || "Failed to delete notice", "error");
    }
  };

  const renderNoticeItem = ({ item }: { item: any }) => {
    const isActive = !!item.isActive;
    
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="bg-[#1e293b] rounded-3xl mb-4 overflow-hidden border border-slate-700"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View className="p-5 flex-row gap-4">
          <View className="w-14 h-14 rounded-2xl bg-slate-700 border border-slate-600 items-center justify-center overflow-hidden">
            <AppIcon name="notices" size={24} color="#f59e0b" />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-[15px] font-black text-white uppercase flex-1 mr-2 leading-tight" numberOfLines={2}>
                {item.noticeTitle || "Untitled Notice"}
              </Text>
              <View className={`px-2.5 py-1 rounded-lg border ${isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-700/50 border-slate-600"}`}>
                <Text className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
                  {isActive ? "Active" : "Expired"}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center gap-2 mb-1.5">
              <AppIcon name="calendar" size={13} color="#94a3b8" />
              <Text className="text-[12px] font-bold text-slate-400 flex-1" numberOfLines={1}>
                {formatDisplayDate(item.noticeDate)}
              </Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <AppIcon name="profile" size={13} color="#94a3b8" />
              <Text className="text-[12px] font-bold text-slate-400 flex-1" numberOfLines={1}>
                Target: <Text className="text-white">{item.targetAudience || "Everyone"}</Text>
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-end items-center px-5 py-3 bg-slate-800/40 border-t border-slate-700/50 gap-3">
          <TouchableOpacity 
            onPress={() => router.push(`/(admin)/notice-form?id=${item.noticeID}`)}
            className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center"
          >
            <AppIcon name="edit" size={18} color="#818cf8" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleDelete(item)}
            className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center"
          >
            <AppIcon name="delete" size={18} color="#fb7185" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
