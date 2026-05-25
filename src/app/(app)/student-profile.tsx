import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { useGetApiStudentGetByIDId } from "@/api/generated/3-student-crud/3-student-crud";
import { StudentModel } from "@/api/model/studentModel";
import { parseApiData } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

export default function StudentProfileScreen() {
  const { isMobile } = useBreakpoint();
  const { id } = useLocalSearchParams();
  const studentId = Number(id) || 0;
  const { data, isLoading: loading } = useGetApiStudentGetByIDId(studentId, {
    query: { enabled: studentId > 0 },
  });
  const student = parseApiData<StudentModel>(data?.data);

  const handleCall = () => {
    if (Platform.OS !== 'web' && student?.studentNumber) {
      Linking.openURL(`tel:${student.studentNumber}`);
    }
  };

  const handleWhatsApp = () => {
    if (Platform.OS !== 'web' && student?.studentNumber) {
      Linking.openURL(`whatsapp://send?phone=+91${student.studentNumber}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <PremiumLoader color={Colors.primary} size={40} />
      </View>
    );
  }

  if (!student) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-500 font-extrabold text-sm uppercase tracking-wider mb-4">Student profile not located</Text>
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="px-6 py-3 bg-[#0d3666] rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white font-black uppercase text-xs tracking-wider">Return Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = student.studentDisplayName || `${student.firstName} ${student.lastName}`;

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <ScreenHeader 
        title="Student Profile" 
        subtitle={`GR No: ${student.studentGRNo || 'N/A'}`}
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10 px-4">
          
          {/* Header Profile Card */}
          <Card className="bg-white border border-gray-150 p-6 mb-6 flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
            <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center border-4 border-blue-100">
              <Text className="text-4xl">{student.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
            </View>
            
            <View className="flex-1 items-center md:items-start">
              <View className="flex-row items-center gap-3 mb-1.5">
                <Text className="text-2xl font-black text-gray-900">{name}</Text>
                <View className="px-2.5 py-0.5 bg-emerald-50 rounded border border-emerald-100">
                  <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Active</Text>
                </View>
              </View>
              <Text className="text-[13px] text-gray-450 font-bold mb-4">
                Roll No: {student.rollNo || 'N/A'} • Class ID: {student.classID || 'N/A'}
              </Text>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={handleCall}
                  className="px-5 py-3 bg-[#0d3666] rounded-xl shadow-md shadow-indigo-150"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-black uppercase tracking-wider">📞 Call Parent</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleWhatsApp}
                  className="px-5 py-3 bg-emerald-50 border border-emerald-150 rounded-xl"
                  activeOpacity={0.8}
                >
                  <Text className="text-emerald-700 text-xs font-black uppercase tracking-wider">💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <View className={`flex-col ${!isMobile ? 'flex-row gap-6' : 'gap-6'}`}>
            {/* Personal Details */}
            <View className={`${!isMobile ? 'flex-1' : ''}`}>
              <Card className="bg-white border border-gray-150 p-6">
                <Text className="text-[12px] font-black text-gray-400 mb-5 uppercase tracking-wider">Personal Details</Text>
                <View className="gap-5">
                  <DetailItem label="Full Legal Name" value={name} />
                  <DetailItem label="Email Address" value={student.studentEmail || 'N/A'} />
                  <DetailItem label="Gender" value={student.gender || 'N/A'} />
                  <DetailItem label="Date of Birth" value={student.dob || 'N/A'} />
                  <DetailItem label="Current Address" value={student.currentAddress || 'N/A'} />
                </View>
              </Card>
            </View>

            {/* Academic Details */}
            <View className={`${!isMobile ? 'flex-1' : ''}`}>
              <Card className="bg-white border border-gray-150 p-6">
                <Text className="text-[12px] font-black text-gray-400 mb-5 uppercase tracking-wider">Academic Placement</Text>
                <View className="gap-5">
                  <DetailItem label="GR Number" value={student.studentGRNo || 'N/A'} />
                  <DetailItem label="Admission Year" value={student.admissionYear || 'N/A'} />
                  <DetailItem label="Class ID Placement" value={student.classID?.toString() || 'N/A'} />
                  <DetailItem label="Section ID Placement" value={student.sectionID?.toString() || 'N/A'} />
                  <DetailItem label="Batch ID Allocation" value={student.batchID?.toString() || 'N/A'} />
                </View>
              </Card>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <View className="flex-row justify-between items-start border-b border-gray-50 pb-3.5">
      <Text className="text-[13px] text-gray-400 font-extrabold">{label}</Text>
      <Text className="text-[13px] text-gray-805 font-black text-right flex-1 ml-4">{value}</Text>
    </View>
  );
}
