import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";

// Mock Student Data based on API Contract
const MOCK_STUDENT = {
  id: "stu_889",
  personal: {
    name: "Pooja Patel",
    gender: "Female",
    dob: "18 Apr, 2012",
    bloodGroup: "O+",
  },
  parent: {
    fatherName: "Amit Patel",
    motherName: "Neha Patel",
    mobile: "9876543255",
    email: "amit.patel@gmail.com",
    address: "B-402, Shanti Heights, Singarva, Ahmedabad",
  },
  academic: {
    admissionFormNo: "LAES-2026-089",
    batchName: "Class I - A",
    admissionDate: "18 May, 2026",
    status: "Active",
  },
  attendanceSummary: {
    present: 42,
    total: 45,
    percentage: 93.3,
  },
  financialSummary: {
    totalDue: 15000,
    paid: 5000,
    outstanding: 10000,
  }
};

export default function StudentProfileScreen() {
  const { isMobile } = useBreakpoint();

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`tel:${MOCK_STUDENT.parent.mobile}`);
    }
  };

  const handleWhatsApp = () => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`whatsapp://send?phone=+91${MOCK_STUDENT.parent.mobile}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">Student Profile</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              {MOCK_STUDENT.academic.admissionFormNo}
            </Text>
          </View>
        </View>

        <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
          <Text className="text-xs font-bold text-gray-700">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">
          
          {/* Header Profile Card */}
          <Card className="bg-white border border-gray-100 p-6 mb-6 flex-col md:flex-row items-center md:items-start gap-6">
            <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center border-4 border-indigo-100">
              <Text className="text-4xl">👧🏻</Text>
            </View>
            
            <View className="flex-1 items-center md:items-start">
              <View className="flex-row items-center gap-3 mb-1">
                <Text className="text-2xl font-bold text-gray-900">{MOCK_STUDENT.personal.name}</Text>
                <View className="px-2.5 py-1 bg-green-50 rounded-full">
                  <Text className="text-[10px] font-bold text-green-700">{MOCK_STUDENT.academic.status}</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-500 font-semibold mb-4">
                {MOCK_STUDENT.academic.batchName} • Roll No: 14
              </Text>
              
              <View className="flex-row gap-3 w-full md:w-auto">
                <TouchableOpacity 
                  onPress={handleCall}
                  className="flex-1 md:flex-none flex-row items-center justify-center gap-2 px-4 py-2.5 bg-[#0d3666] rounded-xl"
                >
                  <Text className="text-sm">📞</Text>
                  <Text className="text-sm font-bold text-white">Call Parent</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleWhatsApp}
                  className="flex-1 md:flex-none flex-row items-center justify-center gap-2 px-4 py-2.5 bg-[#128C7E] rounded-xl"
                >
                  <Text className="text-sm">💬</Text>
                  <Text className="text-sm font-bold text-white">WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 md:flex-none flex-row items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl">
                  <Text className="text-sm font-bold text-gray-700">ID Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Grid Layout for Details */}
          <View className={`flex-row flex-wrap gap-6 ${isMobile ? "flex-col" : ""}`}>
            
            {/* Left Column (Main Info) */}
            <View className="flex-1 min-w-[300px] gap-6">
              
              {/* Personal Info */}
              <Card className="bg-white border border-gray-100 p-5">
                <Text className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Personal Details</Text>
                <View className="gap-4">
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Date of Birth</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.personal.dob}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Gender</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.personal.gender}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Blood Group</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.personal.bloodGroup}</Text>
                  </View>
                </View>
              </Card>

              {/* Parent Info */}
              <Card className="bg-white border border-gray-100 p-5">
                <Text className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Parent Details</Text>
                <View className="gap-4">
                  <View>
                    <Text className="text-xs font-semibold text-gray-400 mb-1">Father's Name</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.parent.fatherName}</Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-gray-400 mb-1">Mother's Name</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.parent.motherName}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Mobile</Text>
                    <Text className="text-sm font-bold text-[#0d3666]">{MOCK_STUDENT.parent.mobile}</Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-gray-400 mb-1">Address</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.parent.address}</Text>
                  </View>
                </View>
              </Card>
              
            </View>

            {/* Right Column (Stats & Academic) */}
            <View className="flex-1 min-w-[300px] gap-6">
              
              {/* Quick Stats Grid */}
              <View className="flex-row gap-4">
                <Card className="flex-1 bg-[#0d3666] p-4 items-center justify-center">
                  <Text className="text-2xl font-bold text-white mb-1">{MOCK_STUDENT.attendanceSummary.percentage}%</Text>
                  <Text className="text-[10px] font-semibold text-indigo-200 text-center">Attendance</Text>
                </Card>
                <Card className="flex-1 bg-orange-50 border border-orange-100 p-4 items-center justify-center">
                  <Text className="text-xl font-bold text-[#f5921e] mb-1">₹{MOCK_STUDENT.financialSummary.outstanding}</Text>
                  <Text className="text-[10px] font-semibold text-orange-500 text-center">Unpaid Fees</Text>
                </Card>
              </View>

              {/* Academic Info */}
              <Card className="bg-white border border-gray-100 p-5">
                <Text className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Academic Details</Text>
                <View className="gap-4">
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Admission No.</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.academic.admissionFormNo}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Admission Date</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.academic.admissionDate}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-semibold text-gray-400">Current Class</Text>
                    <Text className="text-sm font-bold text-gray-800">{MOCK_STUDENT.academic.batchName}</Text>
                  </View>
                </View>
              </Card>

              {/* Student History */}
              <Card className="bg-white border border-gray-100 p-5">
                <Text className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">Student History</Text>
                <View className="gap-4">
                  <View className="border-l-2 border-indigo-100 pl-4 py-1 relative">
                    <View className="absolute w-2 h-2 bg-[#0d3666] rounded-full -left-[5px] top-2" />
                    <Text className="text-[10px] font-bold text-[#f5921e] mb-0.5">2025-2026</Text>
                    <Text className="text-sm font-bold text-gray-800">Sr. KG - Promoted</Text>
                    <Text className="text-xs font-semibold text-gray-400 mt-1">Grade: A+ • Attendance: 95%</Text>
                  </View>
                  <View className="border-l-2 border-indigo-100 pl-4 py-1 relative">
                    <View className="absolute w-2 h-2 bg-gray-300 rounded-full -left-[5px] top-2" />
                    <Text className="text-[10px] font-bold text-gray-400 mb-0.5">2024-2025</Text>
                    <Text className="text-sm font-bold text-gray-600">Jr. KG - Promoted</Text>
                    <Text className="text-xs font-semibold text-gray-400 mt-1">Grade: A • Attendance: 92%</Text>
                  </View>
                  <View className="border-l-2 border-indigo-100 pl-4 py-1 relative">
                    <View className="absolute w-2 h-2 bg-gray-300 rounded-full -left-[5px] top-2" />
                    <Text className="text-[10px] font-bold text-gray-400 mb-0.5">18 May, 2024</Text>
                    <Text className="text-sm font-bold text-gray-600">Initial Admission</Text>
                    <Text className="text-xs font-semibold text-gray-400 mt-1">Joined Nursery</Text>
                  </View>
                </View>
              </Card>

            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
