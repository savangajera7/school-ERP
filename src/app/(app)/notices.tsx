import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useGetApiNoticeGetNoticeList } from "@/api/generated/notice/notice";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function StudentNoticeHistoryScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<"school" | "class">("school");
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  
  const { data: noticesData, isLoading, refetch } = useGetApiNoticeGetNoticeList();

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
        accentColor={Colors.accent}
        icon={
          <View className="w-10 h-10 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
            <Text className="text-lg">📢</Text>
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
                <Text className="text-[11px] font-black text-[#134A8C] uppercase tracking-wide">
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
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <ScreenHeader 
        title="Notice Board" 
        subtitle="Official school announcements & circulars"
        breadcrumb={["Notice Board"]}
        onBack={() => router.push("/(app)/dashboard")}
      />

      {/* High-End Tab Bar Switcher */}
      <View className="px-6 -mt-6 max-w-[800px] w-full self-center">
        <View 
          className="bg-white p-1 rounded-2xl flex-row border border-gray-150"
          style={{
            boxShadow: "0px 8px 16px rgba(0,0,0,0.04)",
          }}
        >
          <TouchableOpacity 
            onPress={() => setActiveTab("school")}
            activeOpacity={0.8}
            className={`flex-1 items-center py-3 rounded-xl flex-row justify-center gap-1.5 ${
              activeTab === 'school' ? 'bg-[#134A8C]' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-black uppercase tracking-wider ${
              activeTab === 'school' ? 'text-white' : 'text-gray-400'
            }`}>
              🏢 School Notices
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("class")}
            activeOpacity={0.8}
            className={`flex-1 items-center py-3 rounded-xl flex-row justify-center gap-1.5 ${
              activeTab === 'class' ? 'bg-[#134A8C]' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-black uppercase tracking-wider ${
              activeTab === 'class' ? 'text-white' : 'text-gray-400'
            }`}>
              🏫 Class Notices
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-4 mt-6 md:px-8 max-w-[1000px] w-full self-center">
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
                <Text className="text-4xl mb-3">📭</Text>
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
                <Text className="text-4xl mb-3">📭</Text>
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
                  <View className="w-1.5 bg-[#134A8C] absolute left-0 top-0 bottom-0" />
                  
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
                          <Text className="text-[10px] font-black text-[#134A8C] uppercase tracking-wide">
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
    </SafeAreaView>
  );
}
