import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { Card } from "@/components/ui/Card";
import { MOBILE_TAB_BAR_HEIGHT } from "@/constants/mobileTabs";

export default function StudentSearchScreen() {
  const { isMobile } = useBreakpoint();
  
  // Advanced Filter States
  const [searchName, setSearchName] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchGR, setSearchGR] = useState("");
  const [filterGender, setFilterGender] = useState<"All" | "Male" | "Female">("All");
  const [filterClass, setFilterClass] = useState<string>("All");

  // Call the live API
  const { data, isLoading, refetch } = useGetApiStudentGet();

  const students = useMemo(() => {
    return parseApiList<StudentModel>(data?.data);
  }, [data]);

  // Extract unique classes dynamically
  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    students.forEach((s) => {
      if (s.classID) classes.add(String(s.classID));
    });
    return Array.from(classes).sort();
  }, [students]);

  // Multifold Search Engine
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = (student.studentDisplayName || `${student.firstName} ${student.lastName}`).toLowerCase();
      const roll = (student.rollNo || "").toLowerCase();
      const gr = (student.studentGRNo || "").toLowerCase();

      const matchesName = name.includes(searchName.toLowerCase());
      const matchesRoll = roll.includes(searchRoll.toLowerCase());
      const matchesGR = gr.includes(searchGR.toLowerCase());
      const matchesGender = filterGender === "All" || student.gender === filterGender;
      const matchesClass = filterClass === "All" || String(student.classID) === filterClass;

      return matchesName && matchesRoll && matchesGR && matchesGender && matchesClass;
    });
  }, [students, searchName, searchRoll, searchGR, filterGender, filterClass]);

  const clearFilters = () => {
    setSearchName("");
    setSearchRoll("");
    setSearchGR("");
    setFilterGender("All");
    setFilterClass("All");
  };

  const renderStudentItemMobile = ({ item }: { item: StudentModel }) => {
    const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
    return (
      <MobileDataCard
        key={item.studentID}
        title={fullName}
        subtitle={`GR No: ${item.studentGRNo || "N/A"}`}
        accentColor={Colors.accent}
        icon={
          <View className="w-11 h-11 rounded-xl items-center justify-center bg-blue-50/50 border border-blue-100">
            <GenderIcon gender={item.gender} size={22} />
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
          { label: "Gender", value: item.gender || "N/A" },
          { label: "Registration", value: "Active", highlight: "success" },
        ]}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["left", "right"]}>
      <StatusBar style="dark" />

      {/* Persistent Header */}
      <ScreenHeader
        title="Student Search"
        subtitle="Filter and locate student records"
        hideBack={isMobile}
      />

      <View
        className="flex-1 px-4 md:px-8 max-w-[1200px] w-full self-center"
        style={{ paddingBottom: isMobile ? MOBILE_TAB_BAR_HEIGHT + 24 : 24 }}
      >
        {/* 🛠️ Advanced Filters Panel */}
        <Card className="bg-white border border-gray-150 p-5 mb-5 shadow-sm rounded-3xl">
          <View className="flex-row items-center justify-between mb-4 border-b border-gray-50 pb-2">
            <View className="flex-row items-center gap-2">
              <AppIcon name="search" size={18} color="#134A8C" active />
              <Text className="text-[13px] font-black text-gray-900 uppercase tracking-wider">Search Controls</Text>
            </View>
            <TouchableOpacity onPress={clearFilters}>
              <Text className="text-xs font-black text-rose-500 uppercase">Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Grid Layout for Filters */}
          <View className={`gap-4 ${isMobile ? "flex-col" : "flex-row flex-wrap"}`}>
            {/* Search by Name */}
            <View style={isMobile ? undefined : { flex: 1, minWidth: 220 }}>
              <Text className="text-[11px] font-black text-gray-400 uppercase mb-1.5">Student Name</Text>
              <TextInput
                value={searchName}
                onChangeText={setSearchName}
                placeholder="Type display/first name..."
                placeholderTextColor="#9CA3AF"
                className="h-[44px] bg-gray-55 border border-gray-200 rounded-xl px-3 text-xs font-bold text-gray-800"
                style={{ outlineWidth: 0 } as any}
              />
            </View>

            {/* Search by Roll No */}
            <View style={isMobile ? undefined : { width: 140 }}>
              <Text className="text-[11px] font-black text-gray-400 uppercase mb-1.5">Roll Number</Text>
              <TextInput
                value={searchRoll}
                onChangeText={setSearchRoll}
                placeholder="e.g. 101"
                placeholderTextColor="#9CA3AF"
                className="h-[44px] bg-gray-55 border border-gray-200 rounded-xl px-3 text-xs font-bold text-gray-800"
                style={{ outlineWidth: 0 } as any}
              />
            </View>

            {/* Search by GR No */}
            <View style={isMobile ? undefined : { width: 140 }}>
              <Text className="text-[11px] font-black text-gray-400 uppercase mb-1.5">GR Number</Text>
              <TextInput
                value={searchGR}
                onChangeText={setSearchGR}
                placeholder="e.g. GR-25"
                placeholderTextColor="#9CA3AF"
                className="h-[44px] bg-gray-55 border border-gray-200 rounded-xl px-3 text-xs font-bold text-gray-800"
                style={{ outlineWidth: 0 } as any}
              />
            </View>

            {/* Filter by Gender */}
            <View style={isMobile ? undefined : { width: 200 }}>
              <Text className="text-[11px] font-black text-gray-400 uppercase mb-1.5">Gender Selection</Text>
              <View className="flex-row bg-gray-55 border border-gray-200 rounded-xl p-0.5 h-[44px]">
                {(["All", "Male", "Female"] as const).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    onPress={() => setFilterGender(gender)}
                    className={`flex-1 justify-center items-center rounded-lg ${
                      filterGender === gender ? "bg-[#134A8C]" : ""
                    }`}
                  >
                    <Text className={`text-[10px] font-black uppercase ${
                      filterGender === gender ? "text-white" : "text-gray-400"
                    }`}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filter by Class ID */}
            <View style={isMobile ? undefined : { width: 150 }}>
              <Text className="text-[11px] font-black text-gray-400 uppercase mb-1.5">Class ID Filter</Text>
              <View className="flex-row flex-wrap gap-1.5">
                <TouchableOpacity
                  onPress={() => setFilterClass("All")}
                  className={`px-3 py-2 rounded-xl border ${
                    filterClass === "All" ? "bg-[#134A8C] border-[#134A8C]" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text className={`text-[10px] font-black uppercase ${filterClass === "All" ? "text-white" : "text-gray-500"}`}>
                    All
                  </Text>
                </TouchableOpacity>
                {uniqueClasses.map((clsId) => (
                  <TouchableOpacity
                    key={clsId}
                    onPress={() => setFilterClass(clsId)}
                    className={`px-3 py-2 rounded-xl border ${
                      filterClass === clsId ? "bg-[#134A8C] border-[#134A8C]" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className={`text-[10px] font-black uppercase ${filterClass === clsId ? "text-white" : "text-gray-500"}`}>
                      Class {clsId}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* 📊 Results Overview Badge */}
        <View className="flex-row justify-between items-center mb-4 px-2">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Found {filteredStudents.length} Matching Student Files
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#134A8C" />}
        </View>

        {/* ── Grid/Table Results Flow ──────────────────────────────── */}
        {isLoading ? (
          <SkeletonLoader variant={isMobile ? "card" : "table"} rows={5} />
        ) : filteredStudents.length === 0 ? (
          <Card className="bg-white border border-gray-150 p-10 items-center rounded-3xl">
            <View className="mb-2">
              <AppIcon name="search" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-sm font-black text-gray-800">No Students Found</Text>
            <Text className="text-xs text-gray-400 font-bold mt-1 text-center">
              Try adjusting your search name, roll number, or class filter selection.
            </Text>
          </Card>
        ) : isMobile ? (
          /* Mobile Virtualized Touch Card Stack */
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItemMobile}
            keyExtractor={(item) => String(item.studentID)}
            contentContainerStyle={{ gap: 12, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* Elegant High-Fidelity Desktop Data Table */
          <Card className="bg-white border border-gray-150 shadow-sm rounded-3xl overflow-hidden">
            <View className="flex-row bg-[#F4F8FC] border-b border-gray-100 px-6 py-4">
              <Text className="w-[100px] font-black text-gray-400 text-[10px] uppercase tracking-wider">Roll No</Text>
              <Text className="flex-1 font-black text-gray-400 text-[10px] uppercase tracking-wider">Student Name</Text>
              <Text className="w-[120px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">GR Number</Text>
              <Text className="w-[120px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">Gender</Text>
              <Text className="w-[120px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">Class ID</Text>
              <Text className="w-[100px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-right">Status</Text>
            </View>

            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => String(item.studentID)}
              renderItem={({ item, index }) => {
                const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
                return (
                  <View
                    className={`flex-row items-center px-6 py-3.5 border-b border-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                    }`}
                  >
                    <Text className="w-[100px] text-xs font-black text-orange-600">Roll #{item.rollNo || "—"}</Text>
                    
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-lg bg-sky-50 items-center justify-center border border-sky-100">
                        <GenderIcon gender={item.gender} size={18} />
                      </View>
                      <Text className="text-sm font-black text-gray-800">{fullName}</Text>
                    </View>

                    <Text className="w-[120px] text-xs font-extrabold text-gray-500 text-center">{item.studentGRNo || "—"}</Text>
                    <Text className="w-[120px] text-xs font-extrabold text-gray-500 text-center">{item.gender || "—"}</Text>
                    <Text className="w-[120px] text-xs font-extrabold text-gray-500 text-center">Class {item.classID || "—"}</Text>
                    
                    <View className="w-[100px] items-end">
                      <View className="px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                        <Text className="text-[9px] font-black text-emerald-600 uppercase">Active</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </Card>
        )}
      </View>

    </SafeAreaView>
  );
}
