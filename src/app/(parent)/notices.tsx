import React, { useState, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNoticeGetNoticeList } from "@/api/generated/notice/notice";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatDisplayDate } from "@/utils/dateHelpers";

export default function ParentNoticesScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiNoticeGetNoticeList();

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
      subtitle="School announcements"
      scrollable={false}
      flatHeader
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
        />
      ) : (
        <FlatList
          data={filteredNotices}
          renderItem={renderNoticeItem}
          keyExtractor={(item) => String(item.noticeID)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
          ListEmptyComponent={
            <EmptyState
              icon="notices"
              title="No notices found"
              message={searchQuery ? "Try a different search" : "No school announcements yet"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      )}
    </PremiumScreenLayout>
  );
}
