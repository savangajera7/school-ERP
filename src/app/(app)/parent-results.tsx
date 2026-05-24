import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { resultService, StudentResult } from "@/services/api/resultService";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

export default function ParentResultsScreen() {
  const { isMobile } = useBreakpoint();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await resultService.getResultsByStudentId(Number(userData?.id) || 1);
      setResults(data);
      if (data.length > 0) {
        setSelectedResult(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <PremiumLoader color={Colors.primary} size={40} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["top", "left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <ScreenHeader 
        title="Academic Results" 
        subtitle="Track your child's learning progress"
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <View className={`px-4 pb-10 max-w-[1200px] w-full self-center ${!isMobile ? 'flex-row gap-6 px-8' : 'gap-4'}`}>
          
          {/* Left Panel: Result List */}
          <View className={`${!isMobile ? 'w-1/3' : ''}`}>
            <Text className="text-[12px] font-black text-gray-400 mb-4 uppercase tracking-wider px-1">Available Report Cards</Text>
            <View className="gap-3">
              {results.map((res: StudentResult, idx: number) => (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => setSelectedResult(res)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedResult?.examName === res.examName 
                      ? 'bg-blue-50/20 border-[#0d3666]' 
                      : 'bg-white border-gray-100'
                  }`}
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`text-sm font-black ${
                      selectedResult?.examName === res.examName ? 'text-[#0d3666]' : 'text-gray-805'
                    }`}>
                      {res.examName}
                    </Text>
                    <View className={`px-2.5 py-0.5 rounded-full border ${
                      res.status === 'Pass' 
                        ? 'bg-emerald-50 border-emerald-100' 
                        : 'bg-rose-50 border-rose-100'
                    }`}>
                      <Text className={`text-[10px] font-black uppercase ${
                        res.status === 'Pass' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {res.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[11px] text-gray-400 font-bold">{res.examDate}</Text>
                  <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-50">
                    <Text className="text-xs font-black text-gray-500">Aggregate: {res.percentage}%</Text>
                    <Text className="text-xs font-black text-[#0d3666]">Grade: {res.grade}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Right Panel: Detail View */}
          {selectedResult && (
            <View className={`${!isMobile ? 'flex-1' : ''}`}>
              <Card className="bg-white border border-gray-150 p-6 overflow-hidden shadow-sm">
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <View>
                    <Text className="text-[16px] font-black text-gray-900">{selectedResult.examName}</Text>
                    <Text className="text-[12px] text-gray-450 font-bold mt-1">Detailed Transcript • Term Evaluation</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-black text-[#0d3666]">{selectedResult.percentage}%</Text>
                    <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Aggregate score</Text>
                  </View>
                </View>

                {/* Mark Table */}
                <View className="bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100">
                  <View className="flex-row bg-gray-50 px-4 py-3.5 border-b border-gray-100">
                    <Text className="flex-[2] text-[10px] font-black text-gray-400 uppercase">Subject Name</Text>
                    <Text className="flex-1 text-[10px] font-black text-gray-400 uppercase text-center">Marks Obtained</Text>
                    <Text className="flex-1 text-[10px] font-black text-gray-400 uppercase text-center">Max Marks</Text>
                    <Text className="flex-1 text-[10px] font-black text-gray-400 uppercase text-right">Grade</Text>
                  </View>
                  {selectedResult.subjects.map((sub: any, idx: number) => (
                    <View key={idx} className={`flex-row px-4 py-4 ${
                      idx !== selectedResult.subjects.length - 1 ? 'border-b border-gray-100' : ''
                    }`}>
                      <Text className="flex-[2] text-sm font-black text-gray-800">{sub.subjectName}</Text>
                      <Text className="flex-1 text-sm font-extrabold text-gray-900 text-center">{sub.marksObtained}</Text>
                      <Text className="flex-1 text-sm font-bold text-gray-400 text-center">{sub.totalMarks}</Text>
                      <Text className={`flex-1 text-sm font-black text-right ${
                        sub.grade.includes('A') ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {sub.grade}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-6 p-4 bg-blue-50/20 rounded-2xl flex-row items-center justify-between border border-blue-50">
                  <View>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Final Result Status</Text>
                    <Text className="text-sm font-black text-gray-800">Promoted to next grade level</Text>
                  </View>
                  <View className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm">
                    <Text className="text-base font-black text-[#0d3666]">{selectedResult.grade}</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
