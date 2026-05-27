import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { useGetApiNoticeGet } from "@/api/generated/8-notice/8-notice";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, NoticeForm, type TableColumn } from "@/components/shared";

export default function TeacherNoticeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetApiNoticeGet();

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

  const tableColumns: TableColumn<any>[] = [
    { key: "noticeTitle", header: "Title", flex: 2 },
    { key: "noticeType", header: "Type", flex: 1 },
    { 
      key: "noticeDate", 
      header: "Date", 
      width: 100,
      render: (n) => <Text className="text-sm text-gray-600">{formatDisplayDate(n.noticeDate)}</Text>
    },
    { key: "targetAudience", header: "Target", width: 100 },
    { 
      key: "isActive", 
      header: "Status", 
      width: 100,
      align: "center",
      render: (n) => (
        <View className={`px-2 py-1 rounded-md border ${n.isActive ? "bg-green-50 border-green-100" : "bg-gray-100 border-gray-200"}`}>
          <Text className={`text-[10px] font-bold ${n.isActive ? "text-green-700" : "text-gray-500"}`}>{n.isActive ? "Active" : "Expired"}</Text>
        </View>
      )
    }
  ];

  const renderNoticeItem = (item: any) => {
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

  const FormHeader = (
    <View>
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

      {showForm && (
        <NoticeForm
          targets={["Class", "Students", "Parents"]}
          defaultTarget="Class"
          defaultRoleId={3}
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </View>
  );

  return (
    <PremiumScreenLayout
      title="Notices"
      subtitle="Class announcements"
      scrollable={false}
      flatHeader
    >
      <ResponsiveDataList
        data={filteredNotices}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderNoticeItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.noticeID)}
        emptyIcon="notices"
        emptyTitle="No notices found"
        emptyMessage={searchQuery ? "Try a different search" : "No class announcements yet"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notices..."
        headerComponent={FormHeader}
      />
    </PremiumScreenLayout>
  );
}
