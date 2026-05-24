import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useGetApiClassGetAll } from "@/api/generated/class/class";
import { useGetApiSectionGetAll } from "@/api/generated/section/section";
import { useGetApiAcademicYearGetAll } from "@/api/generated/academic-year/academic-year";
import { useGetApiBatchGetAll } from "@/api/generated/batch/batch";

type TabKey = "years" | "classes" | "sections" | "batches";

const TAB_ICONS: Record<TabKey, string> = {
  years:    "📅",
  classes:  "🏫",
  sections: "📋",
  batches:  "🎓",
};

const TAB_COLORS: Record<TabKey, { bg: string; border: string; text: string }> = {
  years:    { bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600"   },
  classes:  { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-600" },
  sections: { bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-600"  },
  batches:  { bg: "bg-emerald-50",border: "border-emerald-100",text: "text-emerald-600"},
};

export default function AcademicSetupScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<TabKey>("years");
  const [search, setSearch] = useState("");

  const { data: yearsData,    isLoading: loadingYears    } = useGetApiAcademicYearGetAll();
  const { data: classesData,  isLoading: loadingClasses  } = useGetApiClassGetAll();
  const { data: sectionsData, isLoading: loadingSections } = useGetApiSectionGetAll();
  const { data: batchesData,  isLoading: loadingBatches  } = useGetApiBatchGetAll();

  const isLoading = loadingYears || loadingClasses || loadingSections || loadingBatches;

  const activeData = useMemo(() => {
    let raw: any[] = [];
    let idKey = "";
    let nameKey = "";

    switch (activeTab) {
      case "years":
        raw     = yearsData?.data?.data    || (yearsData?.data    as any) || [];
        idKey   = "academicYearID";
        nameKey = "academicYearName";
        break;
      case "classes":
        raw     = classesData?.data?.data  || (classesData?.data  as any) || [];
        idKey   = "classID";
        nameKey = "className";
        break;
      case "sections":
        raw     = sectionsData?.data?.data || (sectionsData?.data as any) || [];
        idKey   = "sectionID";
        nameKey = "sectionName";
        break;
      case "batches":
        raw     = batchesData?.data?.data  || (batchesData?.data  as any) || [];
        idKey   = "batchID";
        nameKey = "batchName";
        break;
    }

    if (!Array.isArray(raw)) return { items: [], idKey, nameKey };

    const filtered = search.trim()
      ? raw.filter((item) =>
          String(item[nameKey] ?? "").toLowerCase().includes(search.toLowerCase())
        )
      : raw;

    return { items: filtered, idKey, nameKey };
  }, [activeTab, search, yearsData, classesData, sectionsData, batchesData]);

  const colors = TAB_COLORS[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["top", "left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Academic Setup"
        subtitle="School infrastructure configuration"
        onBack={() => router.back()}
      />

      {/* Tab Switcher */}
      <View className="px-4 md:px-8 -mt-6">
        <View
          className="bg-white p-1 rounded-2xl flex-row border border-gray-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.05,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          {(["years", "classes", "sections", "batches"] as TabKey[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => { setActiveTab(tab); setSearch(""); }}
              activeOpacity={0.8}
              className={`flex-1 items-center py-3 rounded-xl flex-row justify-center gap-1 ${
                activeTab === tab ? "bg-[#0d3666]" : "bg-transparent"
              }`}
            >
              <Text style={{ fontSize: isMobile ? 12 : 14 }}>{TAB_ICONS[tab]}</Text>
              <Text
                className={`font-black uppercase tracking-wider ${
                  activeTab === tab ? "text-white" : "text-gray-400"
                }`}
                style={{ fontSize: isMobile ? 9 : 11 }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 mt-6 md:px-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Section header + search */}
          <View className={`flex-row items-center gap-4 mb-5 ${isMobile ? "flex-col items-stretch" : ""}`}>
            <View className="flex-row items-center gap-3 flex-1">
              <View className={`w-10 h-10 rounded-xl items-center justify-center border ${colors.bg} ${colors.border}`}>
                <Text className="text-xl">{TAB_ICONS[activeTab]}</Text>
              </View>
              <View>
                <Text className="text-[16px] font-black text-gray-900 capitalize">{activeTab} Management</Text>
                <Text className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">
                  {activeData.items.length} record{activeData.items.length !== 1 ? "s" : ""} found
                </Text>
              </View>
            </View>

            {/* Search bar */}
            <View
              className="flex-row bg-white border border-gray-200 rounded-xl h-[44px] px-3 items-center gap-2"
              style={{ minWidth: isMobile ? "100%" : 220 }}
            >
              <Text className="text-gray-300">🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${activeTab}…`}
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-sm font-semibold text-gray-800"
                style={{ outlineWidth: 0 } as any}
              />
            </View>
          </View>

          {isLoading ? (
            <View className="py-20">
              <PremiumLoader color={Colors.primary} size={36} />
            </View>
          ) : activeData.items.length === 0 ? (
            <View className="py-20 items-center justify-center bg-white rounded-3xl border border-gray-100">
              <Text className="text-4xl mb-3">{TAB_ICONS[activeTab]}</Text>
              <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                No {activeTab} configured yet
              </Text>
              <Text className="text-gray-300 font-semibold text-xs mt-2">
                Contact your administrator to add records
              </Text>
            </View>
          ) : (
            <View className={`${!isMobile ? "flex-row flex-wrap gap-4" : "gap-3"}`}>
              {activeData.items.map((item: any, index: number) => {
                const id   = item[activeData.idKey]   ?? index + 1;
                const name = item[activeData.nameKey] ?? "Unnamed";
                return (
                  <Card
                    key={id}
                    className={`bg-white border border-gray-150 p-4 flex-row justify-between items-center shadow-sm ${
                      !isMobile ? "w-[calc(50%-8px)]" : ""
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.03,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      {/* Colored index badge */}
                      <View className={`w-9 h-9 rounded-xl items-center justify-center border ${colors.bg} ${colors.border}`}>
                        <Text className={`text-xs font-black ${colors.text}`}>{index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-gray-900" numberOfLines={1}>{name}</Text>
                        <Text className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase">
                          ID: {id}
                        </Text>
                      </View>
                    </View>

                    {/* Action hint */}
                    <View className={`px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border}`}>
                      <Text className={`text-[10px] font-black uppercase tracking-wider ${colors.text}`}>
                        Active
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
