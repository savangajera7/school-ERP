import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGetAllStudents } from "@/api/generated/student/student";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { Card } from "@/components/ui/Card";

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

  const renderStudentItemMobile = ({ item, index }: { item: StudentModel; index: number }) => {
    const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
    return (
      <MobileDataCard
        key={item.studentID}
        title={fullName}
        subtitle={`GR No: ${item.studentGRNo || "N/A"}`}
        accentColor={Colors.accent}
        icon={
          <View className="w-11 h-11 rounded-xl items-center justify-center bg-blue-50/50 border border-blue-100">
            <Text className="text-lg">{item.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
          </View>
        }
        badge={
          <View className="bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-lg">
            <Text className="text-[10px] font-black text-orange-600 uppercase">
              Roll: {item.rollNo || "N/A"}
            </Text>
          </View>
        }
        fields={[
          { label: "Class ID", value: String(item.classID || "N/A") },
          { label: "Section ID", value: String(item.sectionID || "N/A") },
          { label: "Status", value: "Active", highlight: "success" },
        ]}
        onPress={() =>
          router.push({
            pathname: "/(app)/student-profile",
            params: { id: item.studentID },
          })
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Students Ledger"
        subtitle="Manage student details and records"
        breadcrumb={["Students"]}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push("/(app)/admission-form")}
            activeOpacity={0.8}
            className="bg-[#F5921E] px-4.5 py-2.5 rounded-xl shadow-md shadow-amber-500/20"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">
              + New Admission
            </Text>
          </TouchableOpacity>
        }
      />

      <View className="flex-1 px-4 md:px-8 max-w-[1400px] w-full self-center">
        {/* Search Bar */}
        <View className="my-5">
          <View
            className="bg-white flex-row items-center px-4 h-[52px] rounded-2xl border border-gray-150"
            style={{
              boxShadow: "0px 2px 8px rgba(0,0,0,0.03)",
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

        {isLoading ? (
          <View className="py-6">
            <SkeletonLoader variant={isMobile ? "card" : "table"} rows={5} />
          </View>
        ) : isMobile ? (
          /* Mobile FlatList with Card View */
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItemMobile}
            keyExtractor={(item) => item.studentID?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 bg-white rounded-3xl border border-gray-150 mt-2">
                <Text className="text-4xl mb-4">📭</Text>
                <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                  No students found
                </Text>
                <Text className="text-gray-350 font-semibold text-xs mt-2 text-center px-6">
                  {searchQuery ? "Try a different search term" : "Add your first student to get started"}
                </Text>
              </View>
            }
            onRefresh={refetch}
            refreshing={isLoading}
          />
        ) : (
          /* Desktop Table View inside a clean Section Card */
          <FlatList
            data={[1]} // dummy array to wrap table scroll inside FlatList elegantly
            renderItem={() => (
              <Card noPadding className="bg-white border border-gray-150 overflow-hidden shadow-sm">
                {/* Table Header */}
                <View className="flex-row items-center px-6 py-4 bg-gray-50 border-b border-gray-150">
                  <Text className="w-16 text-[11px] font-black text-gray-450 uppercase">Roll</Text>
                  <Text className="w-28 text-[11px] font-black text-gray-450 uppercase">GR No</Text>
                  <Text className="flex-1 text-[11px] font-black text-gray-450 uppercase">Student Name</Text>
                  <Text className="w-24 text-[11px] font-black text-gray-450 uppercase">Gender</Text>
                  <Text className="w-24 text-[11px] font-black text-gray-450 uppercase text-center">Class ID</Text>
                  <Text className="w-24 text-[11px] font-black text-gray-450 uppercase text-center">Section ID</Text>
                  <Text className="w-28 text-[11px] font-black text-gray-450 uppercase text-right">Actions</Text>
                </View>

                {/* Table Rows */}
                {filteredStudents.length === 0 ? (
                  <View className="items-center justify-center py-20 bg-white">
                    <Text className="text-4xl mb-4">📭</Text>
                    <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                      No matching records found
                    </Text>
                  </View>
                ) : (
                  filteredStudents.map((item, index) => {
                    const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
                    return (
                      <View
                        key={item.studentID}
                        className={`flex-row items-center px-6 py-3.5 border-b border-gray-100 hover:bg-gray-50/50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-55/20"
                        }`}
                      >
                        <Text className="w-16 text-sm font-black text-gray-400">{item.rollNo || "—"}</Text>
                        <Text className="w-28 text-sm font-bold text-gray-700">{item.studentGRNo || "—"}</Text>
                        <View className="flex-1 flex-row items-center gap-3">
                          <View className="w-8 h-8 rounded-lg items-center justify-center bg-blue-50/50 border border-blue-100">
                            <Text className="text-sm">{item.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
                          </View>
                          <Text className="text-sm font-black text-gray-900">{fullName}</Text>
                        </View>
                        <Text className="w-24 text-sm font-semibold text-gray-500">{item.gender || "—"}</Text>
                        <Text className="w-24 text-sm font-black text-gray-600 text-center">{item.classID || "—"}</Text>
                        <Text className="w-24 text-sm font-black text-gray-600 text-center">{item.sectionID || "—"}</Text>
                        <View className="w-28 flex-row justify-end">
                          <TouchableOpacity
                            onPress={() =>
                              router.push({
                                pathname: "/(app)/student-profile",
                                params: { id: item.studentID },
                              })
                            }
                            className="bg-[#134A8C]/10 border border-[#134A8C]/20 px-3.5 py-1.5 rounded-xl"
                            activeOpacity={0.8}
                          >
                            <Text className="text-[11px] font-black text-[#134A8C] uppercase tracking-wide">
                              Profile
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </Card>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
