import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGetAllStudents } from "@/api/generated/student/student";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

export default function StudentManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading, refetch } = useGetApiStudentGetAllStudents();
  
  const students = useMemo(() => {
    return (data?.data?.data || []) as StudentModel[];
  }, [data]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.studentDisplayName || `${student.firstName} ${student.lastName}`;
      const search = searchQuery.toLowerCase();
      return name.toLowerCase().includes(search) || 
             student.rollNo?.toLowerCase().includes(search) ||
             student.studentGRNo?.toLowerCase().includes(search);
    });
  }, [students, searchQuery]);

  const renderStudentItem = ({ item }: { item: StudentModel }) => {
    const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
    
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/(app)/student-profile",
          params: { id: item.studentID }
        })}
        activeOpacity={0.7}
        className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <View 
          className="w-14 h-14 rounded-full items-center justify-center border-2 border-primary/10 bg-primary/5"
        >
          <Text className="text-2xl">{item.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
        </View>
        
        <View className="flex-1 ml-4">
          <Text className="text-[16px] font-bold text-primary mb-1">
            {fullName}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="bg-accent/10 px-2 py-0.5 rounded-md">
              <Text className="text-[11px] font-bold text-accent">ROLL: {item.rollNo || 'N/A'}</Text>
            </View>
            <Text className="text-[12px] text-gray-400 font-medium">GR: {item.studentGRNo || 'N/A'}</Text>
          </View>
        </View>

        <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center">
          <Text className="text-gray-400 text-xs">➡️</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <PremiumLoader color={Colors.primary} size={40} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-6 py-6 flex-row justify-between items-center border-b border-gray-50">
        <View>
          <Text className="text-2xl font-black text-primary">Students</Text>
          <Text className="text-[13px] text-gray-400 font-bold mt-1">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'Record' : 'Records'} Found
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push("/(app)/admission-form")}
          activeOpacity={0.8}
          className="bg-accent px-5 py-3 rounded-2xl shadow-lg shadow-accent/20"
        >
          <Text className="text-white font-bold">+ Add Student</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        {/* Search Bar */}
        <View className="my-6">
          <View 
            className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50"
          >
            <Text className="text-lg mr-3">🔍</Text>
            <TextInput
              className="flex-1 h-full text-[15px] font-medium text-primary"
              placeholder="Search by name, roll no or GR..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ outlineWidth: 0 } as any}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text className="text-gray-300 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Student List */}
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.studentID?.toString() || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-4xl mb-4">📭</Text>
              <Text className="text-gray-400 font-bold text-center">
                No students found matching your search.
              </Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
