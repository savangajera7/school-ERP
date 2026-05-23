import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { setupService, AcademicYear, ClassDetail, SectionDetail, BatchDetail } from "@/services/api/setupService";

export default function AcademicSetupScreen() {
  const { isMobile } = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"years" | "classes" | "sections" | "batches">("years");
  
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassDetail[]>([]);
  const [sections, setSections] = useState<SectionDetail[]>([]);
  const [batches, setBatches] = useState<BatchDetail[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [y, c, s, b] = await Promise.all([
        setupService.getAcademicYears(),
        setupService.getClasses(),
        setupService.getSections(),
        setupService.getBatches()
      ]);
      setYears(y);
      setClasses(c);
      setSections(s);
      setBatches(b);
    } catch (error) {
      console.error("Failed to fetch setup data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "years":
        return <SetupList data={years} idKey="academicYearID" nameKey="academicYearName" />;
      case "classes":
        return <SetupList data={classes} idKey="classID" nameKey="className" />;
      case "sections":
        return <SetupList data={sections} idKey="sectionID" nameKey="sectionName" />;
      case "batches":
        return <SetupList data={batches} idKey="batchID" nameKey="batchName" />;
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
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">Academic Setup</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">Manage school structure</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 py-2 border-b border-gray-100 flex-row justify-around">
        <TabButton label="Years" active={activeTab === "years"} onPress={() => setActiveTab("years")} />
        <TabButton label="Classes" active={activeTab === "classes"} onPress={() => setActiveTab("classes")} />
        <TabButton label="Sections" active={activeTab === "sections"} onPress={() => setActiveTab("sections")} />
        <TabButton label="Batches" active={activeTab === "batches"} onPress={() => setActiveTab("batches")} />
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
      className={`px-4 py-2 rounded-lg ${active ? 'bg-indigo-50' : ''}`}
    >
      <Text className={`text-xs font-bold ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</Text>
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
