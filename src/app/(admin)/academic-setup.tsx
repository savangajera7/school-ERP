import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumTabSwitcher } from "@/components/ui/premium";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { useGetApiAcademicYearGet } from "@/api/generated/2-master-academicyear/2-master-academicyear";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { parseApiList } from "@/utils/apiResponse";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";

type TabKey = "years" | "classes" | "batches";

const TAB_ICONS: Record<TabKey, AppIconName> = {
  years: "calendar",
  classes: "academic",
  batches: "students",
};

const TAB_COLORS: Record<TabKey, { bg: string; border: string; text: string }> = {
  years:    { bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600"   },
  classes:  { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-600" },
  batches:  { bg: "bg-emerald-50",border: "border-emerald-100",text: "text-emerald-600"},
};

export default function AcademicSetupScreen() {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<TabKey>("years");
  const [search, setSearch] = useState("");

  const { data: yearsData, isLoading: loadingYears } = useGetApiAcademicYearGet();
  const { data: classesData, isLoading: loadingClasses } = useGetApiClassGetClassList();
  const { data: batchesData, isLoading: loadingBatches } = useGetApiBatchGet();

  const isLoading = loadingYears || loadingClasses || loadingBatches;

  const activeData = useMemo(() => {
    let raw: any[] = [];
    let idKey = "";
    let nameKey = "";

    switch (activeTab) {
      case "years":
        raw = parseApiList(yearsData?.data);
        idKey = "academicYearID";
        nameKey = "academicYearName";
        break;
      case "classes":
        raw = parseApiList(classesData?.data);
        idKey = "classID";
        nameKey = "className";
        break;

      case "batches":
        raw = parseApiList(batchesData?.data);
        idKey = "batchID";
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
  }, [activeTab, search, yearsData, classesData, batchesData]);

  const colors = TAB_COLORS[activeTab];

  return (
    <PremiumScreenLayout
      title="Academic Setup"
      subtitle="School infrastructure configuration"
      onBack={() => router.back()}
      headerSlot={
        <PremiumTabSwitcher
          tabs={[
            { key: "years", label: "Years" },
            { key: "classes", label: "Classes" },
            { key: "batches", label: "Batches" },
          ]}
          active={activeTab}
          onChange={(k) => {
            setActiveTab(k as TabKey);
            setSearch("");
          }}
        />
      }
    >

          {/* Section header + search */}
          <View className={`flex-row items-center gap-4 mb-5 ${isMobile ? "flex-col items-stretch" : ""}`}>
            <View className="flex-row items-center gap-3 flex-1">
              <View className={`w-10 h-10 rounded-xl items-center justify-center border ${colors.bg} ${colors.border}`}>
                <AppIcon name={TAB_ICONS[activeTab]} size={22} color={Colors.primary} active />
              </View>
              <View>
                <Text className="text-[16px] font-black text-gray-900 dark:text-slate-100 capitalize">{activeTab} Management</Text>
                <Text className="text-[11px] text-gray-400 dark:text-slate-500 font-bold mt-0.5 uppercase tracking-wide">
                  {activeData.items.length} record{activeData.items.length !== 1 ? "s" : ""} found
                </Text>
              </View>
            </View>

            {/* Search bar */}
            <View
              className="flex-row bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl h-[44px] px-3 items-center gap-2"
              style={{ minWidth: isMobile ? "100%" : 220 }}
            >
              <AppIcon name="search" size={18} color="#D1D5DB" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${activeTab}…`}
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-sm font-semibold text-gray-800 dark:text-slate-200"
                style={{ outlineWidth: 0 } as any}
              />
            </View>
          </View>

          {isLoading ? (
            <View className="py-20">
              <PremiumLoader color={Colors.primary} size={36} />
            </View>
          ) : activeData.items.length === 0 ? (
            <View className="py-20 items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
              <View className="mb-3">
                <AppIcon name={TAB_ICONS[activeTab]} size={40} color={Colors.primary} active />
              </View>
              <Text className="text-gray-400 dark:text-slate-500 font-extrabold text-sm uppercase tracking-wider">
                No {activeTab} configured yet
              </Text>
              <Text className="text-gray-300 dark:text-slate-600 font-semibold text-xs mt-2">
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
                    className={`bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-4 flex-row justify-between items-center shadow-sm ${
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
                        <Text className="text-sm font-black text-gray-900 dark:text-slate-100" numberOfLines={1}>{name}</Text>
                        <Text className="text-[11px] text-gray-400 dark:text-slate-500 font-bold mt-0.5 uppercase">
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

    </PremiumScreenLayout>
  );
}
