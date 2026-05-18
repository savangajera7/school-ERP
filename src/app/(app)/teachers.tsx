import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

// Mock Data
const MOCK_TEACHERS = [
  { id: "tc_1", name: "Priya Sharma", role: "Faculty", subject: "Mathematics", email: "priya@laes.com", phone: "9876543210", status: "Active" },
  { id: "tc_2", name: "Ananya Verma", role: "Faculty", subject: "Science (EVS)", email: "ananya@laes.com", phone: "9876543211", status: "Active" },
  { id: "tc_3", name: "Ramesh Kumar", role: "Faculty", subject: "English Literature", email: "ramesh@laes.com", phone: "9876543212", status: "Active" },
  { id: "tc_4", name: "Seema Deshmukh", role: "Admin Staff", subject: "Librarian", email: "seema@laes.com", phone: "9876543213", status: "Active" },
];

export default function TeacherManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "add">("list");

  // Add Form State
  const [activeTab, setActiveTab] = useState<"basic" | "education" | "role">("basic");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [assignedClass, setAssignedClass] = useState("");

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTeacher = () => {
    if (!firstName || !lastName || !mobile) {
      Alert.alert("Missing Fields", "Please complete all required Basic details.");
      return;
    }

    const newTeacher = {
      id: `tc_${teachers.length + 1}`,
      name: `${firstName} ${lastName}`,
      role: designation || "Faculty",
      subject: assignedClass || "General Studies",
      email: `${firstName.toLowerCase()}@laes.com`,
      phone: mobile,
      status: "Active"
    };

    setTeachers(prev => [newTeacher, ...prev]);
    setViewMode("list");
    // Reset Form
    setFirstName("");
    setLastName("");
    setMobile("");
    setDesignation("");
    setQualification("");
    setPassingYear("");
    setAssignedClass("");

    if (Platform.OS !== 'web') {
      Alert.alert("Success", "New employee registered successfully!");
    } else {
      window.alert("Success! New employee registered successfully!");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">Teacher Management</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              Manage school faculty and administrative profiles
            </Text>
          </View>
        </View>

        {viewMode === "list" ? (
          <TouchableOpacity 
            onPress={() => setViewMode("add")}
            className="px-4 py-2 bg-[#f5921e] rounded-lg flex-row items-center gap-2 shadow-sm shadow-orange-100"
          >
            <Text className="text-xs font-bold text-white">➕ Add Employee</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => setViewMode("list")}
            className="px-4 py-2 bg-gray-100 rounded-lg flex-row items-center gap-2"
          >
            <Text className="text-xs font-bold text-gray-700">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* MODE 1: Directory List View */}
          {viewMode === "list" && (
            <View className="gap-4">
              {/* Search Bar */}
              <View className="bg-white border border-gray-100 rounded-xl h-[48px] px-4 flex-row items-center gap-3">
                <Text className="text-gray-400">🔍</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search faculty by name or subject..."
                  className="flex-1 text-sm font-semibold text-gray-800"
                />
              </View>

              {/* Table List Card */}
              <Card className="bg-white border border-gray-100 overflow-hidden">
                {/* Header */}
                <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Employee Details</Text>
                  <Text className="w-[150px] text-xs font-bold text-gray-400 uppercase text-center">Designation</Text>
                  <Text className="w-[180px] text-xs font-bold text-gray-400 uppercase text-center">Contact Info</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-right">Status</Text>
                </View>

                {/* Rows */}
                {filteredTeachers.map((tc, index) => (
                  <View 
                    key={tc.id} 
                    className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
                        <Text className="text-lg">👩‍🏫</Text>
                      </View>
                      <View>
                        <Text className="text-sm font-bold text-gray-800">{tc.name}</Text>
                        <Text className="text-[11px] text-gray-450 font-bold mt-0.5">{tc.subject}</Text>
                      </View>
                    </View>

                    <Text className="w-[150px] text-sm text-gray-650 font-bold text-center">{tc.role}</Text>
                    
                    <View className="w-[180px] items-center">
                      <Text className="text-xs text-gray-700 font-bold">{tc.phone}</Text>
                      <Text className="text-[10px] text-gray-400 font-semibold mt-0.5">{tc.email}</Text>
                    </View>

                    <View className="w-[120px] items-end">
                      <View className="px-2.5 py-1 bg-green-50 rounded-full">
                        <Text className="text-[10px] font-bold text-green-700">{tc.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* MODE 2: Add Employee Multi-Tab Wizard */}
          {viewMode === "add" && (
            <View>
              {/* Form Navigation Tabs */}
              <View className="flex-row gap-2 mb-6 border-b border-gray-100 pb-3">
                <TouchableOpacity
                  onPress={() => setActiveTab("basic")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "basic" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
                >
                  <Text className={`text-xs font-bold ${activeTab === "basic" ? "text-white" : "text-gray-600"}`}>
                    👤 Employee Details
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab("education")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "education" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
                >
                  <Text className={`text-xs font-bold ${activeTab === "education" ? "text-white" : "text-gray-600"}`}>
                    🎓 Education Details
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab("role")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "role" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
                >
                  <Text className={`text-xs font-bold ${activeTab === "role" ? "text-white" : "text-gray-600"}`}>
                    🔑 Employee Role Details
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab 1: Basic Details */}
              {activeTab === "basic" && (
                <Card className="bg-white border border-gray-100 p-6 gap-5">
                  <Text className="text-sm font-bold text-[#0d3666] border-b border-gray-50 pb-2">Basic & Personal Details</Text>
                  
                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">First Name *</Text>
                      <TextInput 
                        value={firstName} 
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Last Name *</Text>
                      <TextInput 
                        value={lastName} 
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                        className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                      />
                    </View>
                  </View>

                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Mobile Number *</Text>
                      <TextInput 
                        value={mobile} 
                        onChangeText={setMobile}
                        placeholder="Enter mobile number"
                        keyboardType="numeric"
                        className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Designation</Text>
                      <TextInput 
                        value={designation} 
                        onChangeText={setDesignation}
                        placeholder="e.g. Faculty, Admin Staff"
                        className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                      />
                    </View>
                  </View>
                </Card>
              )}

              {/* Tab 2: Education Details */}
              {activeTab === "education" && (
                <Card className="bg-white border border-gray-100 p-6 gap-5">
                  <Text className="text-sm font-bold text-[#0d3666] border-b border-gray-50 pb-2">Academic & Qualification History</Text>
                  
                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Qualification Degree</Text>
                      <TextInput 
                        value={qualification} 
                        onChangeText={setQualification}
                        placeholder="e.g. B.Ed, M.Sc"
                        className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Passing Year</Text>
                      <TextInput 
                        value={passingYear} 
                        onChangeText={setPassingYear}
                        placeholder="e.g. 2018"
                        keyboardType="numeric"
                        className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                      />
                    </View>
                  </View>
                </Card>
              )}

              {/* Tab 3: Role & Permission Allocations */}
              {activeTab === "role" && (
                <Card className="bg-white border border-gray-100 p-6 gap-5">
                  <Text className="text-sm font-bold text-[#0d3666] border-b border-gray-50 pb-2">App Permission & Assignments</Text>
                  
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Assigned Subject / Class Expertise</Text>
                    <TextInput 
                      value={assignedClass} 
                      onChangeText={setAssignedClass}
                      placeholder="e.g. Mathematics Class I-A"
                      className="h-[44px] bg-gray-50 border border-gray-250 rounded-lg px-4 text-sm font-semibold text-gray-800"
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={handleAddTeacher}
                    className="h-[48px] bg-[#f5921e] rounded-xl justify-center items-center mt-4 shadow-md shadow-orange-100"
                  >
                    <Text className="text-sm font-bold text-white">Save & Register Employee</Text>
                  </TouchableOpacity>
                </Card>
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
