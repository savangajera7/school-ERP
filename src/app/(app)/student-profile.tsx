import React from "react";
import { View, Text, TouchableOpacity, Platform, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Card } from "@/components/ui/Card";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { useGetApiStudentGetByIDId } from "@/api/generated/3-student-crud/3-student-crud";
import { StudentModel } from "@/api/model/studentModel";
import { parseApiData, toCamelCaseRow } from "@/utils/apiResponse";
import { getStudentDisplayName } from "@/utils/studentUtils";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import { IconCircle, AppIcon } from "@/components/icons/AppIcon";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Image } from "react-native";

export default function StudentProfileScreen() {
  const { isMobile } = useResponsive();
  const { id } = useLocalSearchParams();
  const studentId = Number(id) || 0;
  const { data, isLoading: loading, isError, error, refetch } = useGetApiStudentGetByIDId(studentId, {
    query: { enabled: studentId > 0 },
  });
  const raw = parseApiData<Record<string, unknown>>(data);
  const student = raw ? (toCamelCaseRow(raw) as unknown as StudentModel) : null;
  
  const { data: classData } = useGetApiClassGet();
  const classes = React.useMemo(() => parseApiList<any>(classData?.data), [classData]);
  const className = classes.find((c: any) => c.classID === student?.classID)?.className || student?.classID;

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

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <IconCircle name="warning" size={64} iconSize={32} />
        <Text className="text-gray-800 font-extrabold text-lg mt-4 mb-2">Error Loading Profile</Text>
        <Text className="text-gray-500 font-semibold text-center mb-6">
          {(error as any)?.message || "Failed to fetch student details. Please try again."}
        </Text>
        <ScrollView className="w-full max-h-[200px] mb-4 bg-red-50 p-4 rounded-lg">
          <Text className="text-xs text-red-800 font-mono">
            RAW ERROR: {JSON.stringify(error, null, 2)}
          </Text>
        </ScrollView>
        <View className="flex-row gap-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="px-6 py-3 bg-gray-100 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-black uppercase text-xs tracking-wider">Return Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => refetch()} 
            className="px-6 py-3 bg-[#0d3666] rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-black uppercase text-xs tracking-wider">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!student) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-500 font-extrabold text-sm uppercase tracking-wider mb-4">Student profile not located</Text>
        <ScrollView className="w-full max-h-[300px] mb-4 bg-gray-50 p-4 rounded-lg">
          <Text className="text-xs text-gray-500 font-mono">
            RAW DATA: {JSON.stringify(data, null, 2)}
          </Text>
        </ScrollView>
        <View className="flex-row gap-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="px-6 py-3 bg-gray-100 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-black uppercase text-xs tracking-wider">Return Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => refetch()} 
            className="px-6 py-3 bg-[#0d3666] rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-black uppercase text-xs tracking-wider">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const name = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim();

  return (
    <PremiumScreenLayout
      title="Student Profile"
      subtitle={`GR No: ${student.studentGRNo || "N/A"}`}
      onBack={() => router.back()}
    >
      <PremiumCard noAccent style={{ padding: 20, marginBottom: 14 }}>
        <View className="flex-row items-center gap-6">
          <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center border-4 border-blue-100 overflow-hidden">
            {student.studentPhoto ? (
              <Image source={{ uri: student.studentPhoto }} className="w-full h-full" />
            ) : (
              <IconCircle
                name={student.gender === "Female" ? "female" : "male"}
                size={72}
                iconSize={36}
              />
            )}
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-1.5">
              <Text className="text-2xl font-black text-gray-900">{name}</Text>
              <View className="px-2.5 py-0.5 bg-emerald-50 rounded border border-emerald-100">
                <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  {student.isActive ? "Active" : "In-Active"}
                </Text>
              </View>
            </View>
            <Text className="text-[13px] text-gray-450 font-bold mb-4">
              Roll No: {student.rollNo || 'N/A'} • GR No: {student.studentGRNo || 'N/A'}
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
        </View>
      </PremiumCard>

      <View className="gap-6 pb-20">
        {/* SECTION 1: Personal & Identification */}
        <Card className="bg-white border border-gray-150 p-6">
          <View className="flex-row items-center gap-2 mb-5">
            <AppIcon name="profile" size={18} color={Colors.primary} active />
            <Text className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Personal & Identification</Text>
          </View>
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-x-10">
              <DetailItem label="Gender" value={student.gender || 'N/A'} />
              <DetailItem label="Date of Birth" value={student.dob ? String(student.dob).slice(0, 10) : 'N/A'} />
              <DetailItem label="Blood Group" value={(student as any).bloodGroupName || 'N/A'} />
            </View>
            <View className="flex-row flex-wrap gap-x-10">
              <DetailItem label="Religion" value={(student as any).religionName || 'N/A'} />
              <DetailItem label="Category" value={(student as any).categoryName || 'N/A'} />
            </View>
            <View className="h-[1px] bg-gray-50 my-2" />
            <DetailItem label="Aadhaar Number" value={(student as any).aadhaarNo || 'N/A'} />
            <DetailItem label="PEN Number" value={(student as any).penNo || 'N/A'} />
            <DetailItem label="APAR ID" value={(student as any).aparID || 'N/A'} />
          </View>
        </Card>

        {/* SECTION 2: Contact & Address */}
        <Card className="bg-white border border-gray-150 p-6">
          <View className="flex-row items-center gap-2 mb-5">
            <AppIcon name="notifications" size={18} color={Colors.primary} active />
            <Text className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Contact & Address</Text>
          </View>
          <View className="gap-4">
            <DetailItem label="Mobile Number" value={student.studentNumber || 'N/A'} />
            <DetailItem label="Email Address" value={student.studentEmail || 'N/A'} />
            <DetailItem label="Current Address" value={`${student.currentAddress || 'N/A'}, ${(student as any).currentCity || ''}`} />
            <DetailItem label="Permanent Address" value={`${(student as any).permanentAddress || 'N/A'}, ${(student as any).permanentCity || ''}`} />
          </View>
        </Card>

        {/* SECTION 3: Guardian Details */}
        <Card className="bg-white border border-gray-150 p-6">
          <View className="flex-row items-center gap-2 mb-5">
            <AppIcon name="parents" size={18} color={Colors.primary} active />
            <Text className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Guardian Information</Text>
          </View>
          <View className="gap-4">
            <Text className="text-[11px] font-black text-blue-600 uppercase mb-1">Father's Details</Text>
            <DetailItem label="Father Name" value={student.fatherName || 'N/A'} />
            <DetailItem label="Phone Number" value={(student as any).fatherNumber || 'N/A'} />
            <DetailItem label="Occupation" value={(student as any).fatherOccupation || 'N/A'} />
            <DetailItem label="Education" value={(student as any).fatherEducation || 'N/A'} />
            
            <View className="h-[1px] bg-gray-50 my-2" />
            
            <Text className="text-[11px] font-black text-pink-600 uppercase mb-1">Mother's Details</Text>
            <DetailItem label="Mother Name" value={(student as any).motherName || 'N/A'} />
            <DetailItem label="Phone Number" value={(student as any).motherNumber || 'N/A'} />
            <DetailItem label="Occupation" value={(student as any).motherOccupation || 'N/A'} />
            <DetailItem label="Education" value={(student as any).motherEducation || 'N/A'} />
            
            <View className="h-[1px] bg-gray-50 my-2" />
            
            <Text className="text-[11px] font-black text-indigo-600 uppercase mb-1">Parent App Credentials</Text>
            <View className="flex-row flex-wrap gap-x-10">
              <DetailItem label="Username" value={(student as any).parentUserName || 'N/A'} />
              <DetailItem label="Password" value={(student as any).parentPassword || 'N/A'} />
            </View>
          </View>
        </Card>

        {/* SECTION 4: Academic & Registration */}
        <Card className="bg-white border border-gray-150 p-6">
          <View className="flex-row items-center gap-2 mb-5">
            <AppIcon name="subjects" size={18} color={Colors.primary} active />
            <Text className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Academic & Registration</Text>
          </View>
          <View className="gap-4">
            <DetailItem label="Admission Date" value={student.admissionDate ? String(student.admissionDate).slice(0, 10) : 'N/A'} />
            <DetailItem label="Assigned Class" value={className?.toString() || 'N/A'} />
            <DetailItem label="Assigned Batch" value={student.batchID?.toString() || 'N/A'} />
            <DetailItem label="Medium" value={(student as any).mediumName || 'N/A'} />
            <DetailItem label="Previous School" value={(student as any).previousSchoolName || 'N/A'} />
            <DetailItem label="Last Year %" value={`${(student as any).lastSemesterYearPercentage || '0'}%`} />
            <DetailItem label="Reference" value={(student as any).referenceSource || 'N/A'} />
            <DetailItem label="Remarks" value={(student as any).remarks || 'N/A'} />
          </View>
        </Card>
      </View>
    </PremiumScreenLayout>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <View className="flex-1 min-w-[200px] border-b border-gray-50 pb-3">
      <Text className="text-[11px] text-gray-400 font-extrabold uppercase tracking-tight mb-1">{label}</Text>
      <Text className="text-[14px] text-gray-805 font-black">{value}</Text>
    </View>
  );
}
