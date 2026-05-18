import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";

// Mock Student Data
const MOCK_STUDENTS = [
  {
    id: "stu_889",
    name: "Pooja Patel",
    rollNo: "14",
    class: "Class I",
    section: "A",
    gender: "Female",
    parentMobile: "9876543255",
    status: "Active",
  },
  {
    id: "stu_890",
    name: "Rahul Sharma",
    rollNo: "21",
    class: "Class I",
    section: "A",
    gender: "Male",
    parentMobile: "9823412345",
    status: "Active",
  },
  {
    id: "stu_891",
    name: "Aarav Desai",
    rollNo: "03",
    class: "Class II",
    section: "B",
    gender: "Male",
    parentMobile: "9988776655",
    status: "Inactive",
  },
];

const CLASSES = ["All Classes", "Nursery", "Class I", "Class II", "Class III", "Class IV"];

export default function StudentManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");

  const filteredStudents = MOCK_STUDENTS.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.rollNo.includes(searchQuery);
    const matchesClass = selectedClass === "All Classes" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const renderStudentItem = ({ item }: { item: typeof MOCK_STUDENTS[0] }) => (
    <View
      className="bg-white border border-gray-150 rounded-2xl p-5 mb-4 shadow-sm shadow-gray-100/50"
    >
      <View className="flex-row items-center gap-4">
        {/* Circle Student Avatar */}
        <View className="w-14 h-14 bg-orange-50 rounded-full items-center justify-center border-2 border-orange-100 overflow-hidden">
          <Text className="text-2xl">{item.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
        </View>
        
        {/* Name and Basic metadata */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
            <Text className="text-[16px] font-bold text-gray-900">
              ({item.rollNo}) {item.name}
            </Text>
            <View className={`px-2.5 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-green-50' : 'bg-red-50'}`}>
              <Text className={`text-[9px] font-bold uppercase tracking-wider ${item.status === 'Active' ? 'text-green-700' : 'text-red-700'}`}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Father Contact */}
          <View className="flex-row items-center gap-1.5 mb-1">
            <Text className="text-xs text-gray-400">📞</Text>
            <Text className="text-xs text-emerald-700 font-bold">
              +91 {item.parentMobile} <Text className="text-gray-400 font-normal">(Father)</Text>
            </Text>
          </View>

          {/* Simulated Password */}
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs text-gray-400">🔒</Text>
            <Text className="text-xs text-gray-500 font-semibold">
              Password : <Text className="font-bold text-gray-700">{item.name.slice(0, 3).toUpperCase()}{item.parentMobile.slice(-4)}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Class Label & Action Shortcut Ribbon in the footer */}
      <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-50">
        <Text className="text-[12px] text-gray-450 font-bold">
          🎓 {item.class} - Section {item.section}
        </Text>

        <View className="flex-row gap-2">
          {/* Action Button 1: Fees */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/fees")}
            className="w-8 h-8 rounded-lg bg-amber-50 items-center justify-center border border-amber-100"
          >
            <Text className="text-sm">💰</Text>
          </TouchableOpacity>

          {/* Action Button 2: Attendance */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/attendance-reports")}
            className="w-8 h-8 rounded-lg bg-sky-50 items-center justify-center border border-sky-100"
          >
            <Text className="text-sm">📊</Text>
          </TouchableOpacity>

          {/* Action Button 3: View Profile */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/student-profile")}
            className="px-3 h-8 rounded-lg bg-[#0d3666] flex-row items-center gap-1"
          >
            <Text className="text-[10px] font-bold text-white uppercase">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 z-10 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">Student Directory</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              Manage and search enrolled students
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-6 md:px-8 max-w-[1200px] w-full self-center">
        
        {/* Filters and Search */}
        <View className={`flex-row gap-4 mb-6 ${isMobile ? "flex-col" : "items-center"}`}>
          <View className="flex-1 bg-white border border-gray-100 rounded-xl h-[48px] px-4 flex-row items-center gap-3">
            <Text className="text-gray-400">🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by student name or roll number..."
              className="flex-1 text-sm font-semibold text-gray-800"
            />
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-none"
            contentContainerStyle={{ gap: 8 }}
          >
            {CLASSES.map((cls) => (
              <TouchableOpacity
                key={cls}
                onPress={() => setSelectedClass(cls)}
                className={`px-4 h-[48px] justify-center rounded-xl border ${
                  selectedClass === cls 
                    ? "bg-[#0d3666] border-[#0d3666]" 
                    : "bg-white border-gray-100"
                }`}
              >
                <Text className={`text-sm font-bold ${
                  selectedClass === cls ? "text-white" : "text-gray-600"
                }`}>
                  {cls}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Total Count */}
        <Text className="text-sm font-bold text-gray-500 mb-4 px-1">
          Showing {filteredStudents.length} students
        </Text>

        {/* Student List */}
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <Text className="text-4xl mb-4">📭</Text>
              <Text className="text-lg font-bold text-gray-800">No students found</Text>
              <Text className="text-sm text-gray-500 mt-2 text-center max-w-[300px]">
                Try adjusting your search filters to find the student you're looking for.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
