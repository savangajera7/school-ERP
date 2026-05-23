import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGetAllStudents } from "@/api/generated/student/student";

import { PremiumLoader } from "@/components/ui/PremiumLoader";

export default function StudentManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading, refetch } = useGetApiStudentGetAllStudents();
  const students = (data?.data?.data || []) as StudentModel[];

  const filteredStudents = students.filter((student: StudentModel) => {
    const name = student.studentDisplayName || `${student.firstName} ${student.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.rollNo?.includes(searchQuery) ||
                          student.studentGRNo?.includes(searchQuery);
    return matchesSearch;
  });

  const renderStudentItem = ({ item }: { item: StudentModel }) => {
    const name = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
    
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/(app)/student-profile",
          params: { id: item.studentID }
        })}
        className="bg-white border border-gray-150 rounded-2xl p-5 mb-4 shadow-sm shadow-gray-100/50"
      >
        <View className="flex-row items-center gap-4">
          <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center border-2 border-indigo-100 overflow-hidden">
            <Text className="text-2xl">👦🏻</Text>
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
              <Text className="text-[16px] font-bold text-gray-900">
                ({item.rollNo || 'N/A'}) {name}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 mb-1">
              <Text className="text-xs text-gray-400">🆔 GR No:</Text>
              <Text className="text-xs text-indigo-700 font-bold">
                {item.studentGRNo || 'N/A'}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-gray-400">🏫 Class ID:</Text>
              <Text className="text-xs text-gray-500 font-semibold">
                {item.classID}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-50">
          <Text className="text-[12px] text-gray-450 font-bold">
            View Full Profile →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <PremiumLoader />
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
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">Students</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              {filteredStudents.length} Records Found
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => refetch()}
          className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center"
        >
          <Text className="text-sm">🔄</Text>
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-4">
        <View className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex-row items-center gap-3 shadow-sm shadow-gray-100">
          <Text className="text-lg">🔍</Text>
          <TextInput
            placeholder="Search by name, roll no or GR no..."
            className="flex-1 text-sm text-gray-700 font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.studentID?.toString() || Math.random().toString()}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 font-bold">No students found matching search.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
