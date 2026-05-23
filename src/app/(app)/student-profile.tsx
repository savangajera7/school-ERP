import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { studentService } from "@/services/api/studentService";
import { StudentModel } from "@/api/model/studentModel";

export default function StudentProfileScreen() {
  const { isMobile } = useBreakpoint();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentModel | null>(null);

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
    }
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await studentService.getStudentById(Number(id));
      setStudent(data);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <ActivityIndicator size="large" color="#0d3666" />
      </View>
    );
  }

  if (!student) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 font-bold">Student not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = student.studentDisplayName || `${student.firstName} ${student.lastName}`;

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
              GR No: {student.studentGRNo || 'N/A'}
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
              <Text className="text-4xl">👦🏻</Text>
            </View>
            
            <View className="flex-1 items-center md:items-start">
              <View className="flex-row items-center gap-3 mb-1">
                <Text className="text-2xl font-bold text-gray-900">{name}</Text>
                <View className="px-2.5 py-1 bg-green-50 rounded-full">
                  <Text className="text-[10px] font-bold text-green-700">ACTIVE</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-500 font-semibold mb-4">
                Roll No: {student.rollNo || 'N/A'} • Class ID: {student.classID}
              </Text>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={handleCall}
                  className="px-4 py-2.5 bg-[#0d3666] rounded-xl flex-row items-center gap-2"
                >
                  <Text className="text-white text-xs font-bold">📞 Call Parent</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleWhatsApp}
                  className="px-4 py-2.5 bg-emerald-50 rounded-xl flex-row items-center gap-2"
                >
                  <Text className="text-emerald-600 text-xs font-bold">💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <View className={`flex-col ${!isMobile ? 'flex-row flex-wrap gap-6' : ''}`}>
            {/* Personal Details */}
            <View className={`${!isMobile ? 'flex-1 min-w-[400px]' : 'mb-6'}`}>
              <Card className="bg-white border border-gray-100 p-6 h-full">
                <Text className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-wider">Personal Details</Text>
                <View className="gap-5">
                  <DetailItem label="Full Name" value={name} />
                  <DetailItem label="Email" value={student.studentEmail || 'N/A'} />
                  <DetailItem label="Gender" value={student.gender || 'N/A'} />
                  <DetailItem label="DOB" value={student.dob || 'N/A'} />
                  <DetailItem label="Address" value={student.currentAddress || 'N/A'} />
                </View>
              </Card>
            </View>

            {/* Academic Details */}
            <View className={`${!isMobile ? 'flex-1 min-w-[400px]' : 'mb-6'}`}>
              <Card className="bg-white border border-gray-100 p-6 h-full">
                <Text className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-wider">Academic Details</Text>
                <View className="gap-5">
                  <DetailItem label="GR Number" value={student.studentGRNo || 'N/A'} />
                  <DetailItem label="Admission Year" value={student.admissionYear || 'N/A'} />
                  <DetailItem label="Class ID" value={student.classID?.toString() || 'N/A'} />
                  <DetailItem label="Section ID" value={student.sectionID?.toString() || 'N/A'} />
                  <DetailItem label="Batch ID" value={student.batchID?.toString() || 'N/A'} />
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
    <View className="flex-row justify-between items-start border-b border-gray-50 pb-3">
      <Text className="text-[13px] text-gray-400 font-semibold">{label}</Text>
      <Text className="text-[13px] text-gray-800 font-bold text-right flex-1 ml-4">{value}</Text>
    </View>
  );
}
