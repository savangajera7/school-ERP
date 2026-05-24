import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useGetApiClassGetAll } from "@/api/generated/class/class";
import { useGetApiSectionGetAll } from "@/api/generated/section/section";
import { useGetApiAcademicYearGetAll } from "@/api/generated/academic-year/academic-year";
import { useGetApiBatchGetAll } from "@/api/generated/batch/batch";

export default function AcademicSetupScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<"years" | "classes" | "sections" | "batches">("years");
  
  const { data: yearsData, isLoading: loadingYears } = useGetApiAcademicYearGetAll();
  const { data: classesData, isLoading: loadingClasses } = useGetApiClassGetAll();
  const { data: sectionsData, isLoading: loadingSections } = useGetApiSectionGetAll();
  const { data: batchesData, isLoading: loadingBatches } = useGetApiBatchGetAll();

  const loading = loadingYears || loadingClasses || loadingSections || loadingBatches;

  const renderContent = () => {
    switch (activeTab) {
      case "years":
        return <SetupList data={yearsData?.data?.data || []} idKey="academicYearID" nameKey="academicYearName" />;
      case "classes":
        return <SetupList data={classesData?.data?.data || []} idKey="classID" nameKey="className" />;
      case "sections":
        return <SetupList data={sectionsData?.data?.data || []} idKey="sectionID" nameKey="sectionName" />;
      case "batches":
        return <SetupList data={batchesData?.data?.data || []} idKey="batchID" nameKey="batchName" />;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0d3666" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        className="px-6 pt-6 pb-12 rounded-b-[32px]"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/20"
          >
            <Text className="text-white font-bold">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-white">Academic Setup</Text>
            <Text className="text-white/60 text-xs font-bold uppercase tracking-wider mt-0.5">School Infrastructure</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View className="px-6 -mt-6">
        <View className="bg-white p-2 rounded-2xl flex-row shadow-lg shadow-gray-200/50 border border-gray-50">
          <TabButton label="Years" active={activeTab === "years"} onPress={() => setActiveTab("years")} />
          <TabButton label="Classes" active={activeTab === "classes"} onPress={() => setActiveTab("classes")} />
          <TabButton label="Sections" active={activeTab === "sections"} onPress={() => setActiveTab("sections")} />
          <TabButton label="Batches" active={activeTab === "batches"} onPress={() => setActiveTab("batches")} />
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-1 items-center py-2.5 rounded-xl ${active ? 'bg-primary/5' : ''}`}
    >
      <Text className={`text-xs font-black uppercase tracking-tighter ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

function SetupList({ data, idKey, nameKey }: { data: any[], idKey: string, nameKey: string }) {
  const { isMobile } = useBreakpoint();
  
  return (
    <View className={`gap-4 ${!isMobile ? 'flex-row flex-wrap' : ''}`}>
      {data.length === 0 ? (
        <View className="w-full">
          <Text className="text-center text-gray-400 py-10">No records found.</Text>
        </View>
      ) : (
        data.map((item) => (
          <Card 
            key={item[idKey]} 
            className={`bg-white border border-gray-100 p-4 flex-row justify-between items-center ${!isMobile ? 'w-[calc(50%-12px)]' : ''}`}
          >
            <View>
              <Text className="text-sm font-bold text-gray-800">{item[nameKey]}</Text>
              <Text className="text-[10px] text-gray-400 font-semibold mt-1">ID: {item[idKey]}</Text>
            </View>
            <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center">
              <Text className="text-xs">⚙️</Text>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}
