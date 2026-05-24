import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGetAllStudents } from "@/api/generated/student/student";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

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
      return (
        name.toLowerCase().includes(search) ||
        student.rollNo?.toLowerCase().includes(search) ||
        student.studentGRNo?.toLowerCase().includes(search)
      );
    });
  }, [students, searchQuery]);

  const renderStudentItem = ({ item, index }: { item: StudentModel; index: number }) => {
    const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(app)/student-profile",
            params: { id: item.studentID },
          })
        }
        activeOpacity={0.8}
        className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 flex-row items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Avatar */}
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-blue-50 border border-blue-100">
          <Text className="text-xl">{item.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
        </View>

        <View className="flex-1 ml-3.5">
          <Text className="text-[15px] font-black text-gray-900" numberOfLines={1}>
            {fullName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-black text-orange-600 uppercase">
                Roll: {item.rollNo || "N/A"}
              </Text>
            </View>
            <Text className="text-[11px] text-gray-400 font-bold">
              GR: {item.studentGRNo || "N/A"}
            </Text>
          </View>
        </View>

        <View className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-xl items-center justify-center">
          <Text className="text-[11px] text-gray-400">›</Text>
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
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Students"
        subtitle={`${filteredStudents.length} record${filteredStudents.length !== 1 ? "s" : ""} found`}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push("/(app)/admission-form")}
            activeOpacity={0.8}
            className="bg-orange-500 px-4 py-2.5 rounded-xl"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">
              + Admit
            </Text>
          </TouchableOpacity>
        }
      />

      <View className="flex-1 px-4 md:px-8">
        {/* Search Bar */}
        <View className="my-5">
          <View
            className="bg-white flex-row items-center px-4 h-[52px] rounded-2xl border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-base mr-3">🔍</Text>
            <TextInput
              className="flex-1 h-full text-[14px] font-semibold text-gray-800"
              placeholder="Search by name, roll no or GR..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ outlineWidth: 0 } as any}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 font-black text-xs">✕</Text>
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
            <View className="items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 mt-2">
              <Text className="text-4xl mb-4">📭</Text>
              <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                No students found
              </Text>
              <Text className="text-gray-300 font-semibold text-xs mt-2 text-center px-6">
                {searchQuery ? "Try a different search term" : "Add your first student to get started"}
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
