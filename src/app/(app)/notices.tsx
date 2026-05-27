import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumTabSwitcher } from "@/components/ui/premium";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconCircle } from "@/components/icons/AppIcon";
import { useGetApiNoticeGet } from "@/api/generated/8-notice/8-notice";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { useResponsive } from "@/hooks/useResponsive";

import { usePermissions } from "@/hooks/usePermissions";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";

export default function StudentNoticeHistoryScreen() {
  const { isMobile } = useResponsive();
  const { canPublishNotices } = usePermissions();
  const [activeTab, setActiveTab] = useState<"school" | "class">("school");
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  
  const { data: noticesData, isLoading, refetch } = useGetApiNoticeGet();

  const noticeList = useMemo(() => {
    const list = parseApiList(noticesData?.data);
    return list
      .filter((item: Record<string, unknown>) =>
        activeTab === "school"
          ? item.noticeFor === "School" || !item.noticeFor
          : item.noticeFor === "Class"
      )
      .map((item: Record<string, unknown>, idx: number) => ({
        id: String(item.noticeID ?? item.id ?? `not_${idx}`),
        date: String(item.publishDate ?? item.date ?? "N/A"),
        author: String(item.addedBy ?? item.author ?? "Administrator"),
        title: String(item.noticeTitle ?? item.title ?? "Announcement"),
        description: String(item.noticeDescription ?? item.description ?? item.content ?? ""),
      }));
  }, [noticesData, activeTab]);

  const toggleExpand = (id: string) => {
    setExpandedNoticeId(prev => (prev === id ? null : id));
  };

  const renderNoticeItemMobile = ({ item }: { item: any }) => {
    const isExpanded = expandedNoticeId === item.id;
    return (
      <MobileDataCard
        key={item.id}
        title={item.title}
        subtitle={`${item.date} • by ${item.author}`}
        accentColor={Colors.primary}
        icon={
          <View className="w-10 h-10 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
            <IconCircle name="notices" size={40} iconSize={20} />
          </View>
        }
        actions={
          <View className="flex-1 mt-1">
            <Text 
              className="text-sm text-gray-600 leading-relaxed font-semibold"
              numberOfLines={isExpanded ? undefined : 3}
            >
              {item.description}
            </Text>
            {item.description.length > 120 && (
              <TouchableOpacity onPress={() => toggleExpand(item.id)} className="mt-2.5 self-start">
                <Text 
                  className="text-[11px] font-black uppercase tracking-wide"
                  style={{ color: Colors.primary }}
                >
                  {isExpanded ? "Read Less ▲" : "Read More ▼"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Notice Board"
      subtitle="Official school announcements & circulars"
      onBack={() => router.push("/(app)/dashboard")}
      scrollable={false}
      bodyStyle={{ flex: 1, marginTop: -20, paddingHorizontal: 0 }}
      rightAction={
        canPublishNotices && (
          <HeaderActionButton
            label="Compose"
            shortLabel="Post"
            onPress={() => router.push("/(app)/notice-compose")}
          />
        )
      }
      headerSlot={
        <PremiumTabSwitcher
          tabs={[
            { key: "school", label: "School Notices" },
            { key: "class", label: "Class Notices" },
          ]}
          active={activeTab}
          onChange={(k) => setActiveTab(k as "school" | "class")}
        />
      }
    >
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View className="py-6">
            <SkeletonLoader variant={isMobile ? "card" : "table"} rows={4} />
          </View>
        ) : isMobile ? (
          /* Mobile Notice Cards List */
          <FlatList
            data={noticeList}
            renderItem={renderNoticeItemMobile}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            onRefresh={refetch}
            refreshing={isLoading}
            ListEmptyComponent={
              <View className="py-20 items-center justify-center bg-white rounded-3xl border border-gray-150 p-8 mt-2">
                <EmptyState icon="notices" title="No notices" message="Published notices will appear here" />
                <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">No notices posted yet</Text>
              </View>
            }
          />
        ) : (
          /* Desktop Structured List View with expandable row content */
          <FlatList
            data={noticeList}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            onRefresh={refetch}
            refreshing={isLoading}
            ListEmptyComponent={
              <View className="py-20 items-center justify-center bg-white rounded-3xl border border-gray-150 p-8 mt-2">
                <EmptyState icon="notices" title="No notices" message="Published notices will appear here" />
                <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">No announcements posted yet</Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const isExpanded = expandedNoticeId === item.id;
              return (
                <Card 
                  key={item.id} 
                  className="bg-white border border-gray-150 p-5 rounded-2xl mb-4 relative overflow-hidden flex-col shadow-sm"
                >
                  <View className="w-1.5 absolute left-0 top-0 bottom-0" style={{ backgroundColor: Colors.primary }} />
                  
                  <View className="flex-1 pl-3">
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-xs">📅</Text>
                        <Text className="text-xs text-gray-400 font-extrabold">{item.date}</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[10px] text-gray-400">👤</Text>
                        <Text className="text-[10px] text-gray-450 font-black uppercase tracking-wider">
                          Author: {item.author}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-[16px] font-black text-gray-900 mb-2 flex-1">{item.title}</Text>
                      {item.description.length > 200 && (
                        <TouchableOpacity onPress={() => toggleExpand(item.id)} className="bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-xl">
                          <Text 
                            className="text-[10px] font-black uppercase tracking-wide"
                            style={{ color: Colors.primary }}
                          >
                            {isExpanded ? "Collapse ▲" : "Expand Description ▼"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View className="bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 mt-2">
                      <Text 
                        className="text-sm text-gray-700 leading-7 font-semibold"
                        numberOfLines={isExpanded ? undefined : 3}
                      >
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            }}
          />
        )}
      </View>
    </PremiumScreenLayout>
  );
}
