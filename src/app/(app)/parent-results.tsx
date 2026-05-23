import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { resultService, StudentResult } from "@/services/api/resultService";
import { useAuthStore } from "@/store/authStore";

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
      // For parent, we might need to fetch results for their children.
      // For now, using the logged-in user ID (assuming it's the student ID for mock purposes)
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
        <PremiumLoader />
        <Text className="mt-4 text-gray-500 font-bold tracking-tight">Loading Records...</Text>
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
            <Text className="text-xl font-bold text-gray-900">Academic Results</Text>
            <Text className="text-xs text-gray-400 font-semibold">Track your child's progress</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={`p-6 ${!isMobile ? 'flex-row gap-6' : ''}`}>
          
          {/* Left Panel: Result List */}
          <View className={`${!isMobile ? 'w-1/3' : 'mb-6'}`}>
            <Text className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Available Exams</Text>
            <View className="gap-3">
              {results.map((res: StudentResult, idx: number) => (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => setSelectedResult(res)}
                  className={`p-4 rounded-2xl border ${selectedResult?.examName === res.examName ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`text-sm font-bold ${selectedResult?.examName === res.examName ? 'text-indigo-900' : 'text-gray-800'}`}>
                      {res.examName}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-full ${res.status === 'Pass' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <Text className={`text-[10px] font-bold ${res.status === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {res.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-400 font-semibold">{res.examDate}</Text>
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs font-bold text-gray-500">Percentage: {res.percentage}%</Text>
                    <Text className="text-xs font-bold text-indigo-600">Grade: {res.grade}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Right Panel: Detail View */}
          {selectedResult && (
            <View className={`${!isMobile ? 'flex-1' : ''}`}>
              <Card className="bg-white border border-gray-100 p-6 overflow-hidden">
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-gray-50">
                  <View>
                    <Text className="text-lg font-bold text-gray-800">{selectedResult.examName}</Text>
                    <Text className="text-xs text-gray-400 font-semibold mt-1">Detailed Marksheet • Session 2025-26</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-indigo-600">{selectedResult.percentage}%</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Aggregate</Text>
                  </View>
                </View>

                {/* Mark Table */}
                <View className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <View className="flex-row bg-gray-100 px-4 py-3">
                    <Text className="flex-[2] text-[11px] font-bold text-gray-500 uppercase">Subject</Text>
                    <Text className="flex-1 text-[11px] font-bold text-gray-500 uppercase text-center">Marks</Text>
                    <Text className="flex-1 text-[11px] font-bold text-gray-500 uppercase text-center">Total</Text>
                    <Text className="flex-1 text-[11px] font-bold text-gray-500 uppercase text-right">Grade</Text>
                  </View>
                  {selectedResult.subjects.map((sub: any, idx: number) => (
                    <View key={idx} className={`flex-row px-4 py-4 ${idx !== selectedResult.subjects.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <Text className="flex-[2] text-sm font-bold text-gray-700">{sub.subjectName}</Text>
                      <Text className="flex-1 text-sm font-bold text-gray-900 text-center">{sub.marksObtained}</Text>
                      <Text className="flex-1 text-sm font-semibold text-gray-400 text-center">{sub.totalMarks}</Text>
                      <Text className={`flex-1 text-sm font-bold text-right ${sub.grade.includes('A') ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {sub.grade}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-6 p-4 bg-indigo-50 rounded-2xl flex-row items-center justify-between border border-indigo-100">
                  <View>
                    <Text className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Final Result</Text>
                    <Text className="text-base font-bold text-indigo-900">Promoted to next standard</Text>
                  </View>
                  <View className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-indigo-100 shadow-sm">
                    <Text className="text-xl font-bold text-indigo-600">{selectedResult.grade}</Text>
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
