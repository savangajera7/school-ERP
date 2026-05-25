import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiStudentAttendanceInsertStudentAttendance, 
  usePutApiStudentAttendanceUpdateStudentAttendance, 
  useGetApiStudentAttendanceGetStudentAttendanceByIdId 
} from "@/api/generated/student-attendance/student-attendance";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";

export default function AttendanceFormScreen() {
  const { id } = useLocalSearchParams();
  const attendanceID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!attendanceID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [studentID, setStudentID] = useState("");
  const [classID, setClassID] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceStatus, setAttendanceStatus] = useState("Present");
  const [remarks, setRemarks] = useState("");

  const insertAttendance = usePostApiStudentAttendanceInsertStudentAttendance();
  const updateAttendance = usePutApiStudentAttendanceUpdateStudentAttendance();
  const { data: response, isLoading: loadingData } = useGetApiStudentAttendanceGetStudentAttendanceByIdId(attendanceID as number, {
    query: { enabled: isEditing }
  });

  useEffect(() => {
    if (response?.data) {
      const a = parseApiData(response.data) as any;
      setStudentID(String(a.studentID || ""));
      setClassID(String(a.classID || ""));
      setAttendanceDate(a.attendanceDate ? String(a.attendanceDate).slice(0, 10) : "");
      setAttendanceStatus(a.attendanceStatus || "Present");
      setRemarks(a.remarks || "");
    }
  }, [response]);

  const handleSubmit = async () => {
    if (!studentID || !classID) {
      Alert.alert("Missing Fields", "Please complete all required fields (*).");
      return;
    }

    const payload = {
      studentID: parseInt(studentID),
      attendanceDate,
      attendanceStatus,
      remark: remarks,
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateAttendance.mutateAsync({
          data: { 
            ...payload, 
            attendanceID: attendanceID as number, 
            updatedBy: parseInt(userData?.id || "0") 
          }
        });
        Alert.alert("Success", "Attendance record updated successfully!");
      } else {
        await insertAttendance.mutateAsync({
          data: {
            ...payload,
            addedBy: parseInt(userData?.id || "0")
          }
        });
        Alert.alert("Success", "Attendance marked successfully!");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "mark"} attendance`);
    }
  };

  if (loadingData) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching record details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Attendance" : "Mark Attendance"}
      subtitle={isEditing ? "Modify attendance status" : "Record daily presence for a student"}
      onBack={() => router.back()}
      keyboard
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
            <AppIcon name="attendance" size={22} color={Colors.primary} active />
            <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Attendance Data</Text>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>Student ID *</Text>
                <TextInput
                  value={studentID}
                  onChangeText={setStudentID}
                  placeholder="e.g. 102"
                  keyboardType="numeric"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Class ID *</Text>
                <TextInput
                  value={classID}
                  onChangeText={setClassID}
                  placeholder="e.g. 10"
                  keyboardType="numeric"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Attendance Date</Text>
              <TextInput
                value={attendanceDate}
                onChangeText={setAttendanceDate}
                placeholder="YYYY-MM-DD"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View>
              <Text style={styles.label}>Status *</Text>
              <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
                {["Present", "Absent", "Late", "Leave"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setAttendanceStatus(s)}
                    className={`flex-1 items-center justify-center rounded-lg ${attendanceStatus === s ? "bg-[#1A3C6E]" : ""}`}
                  >
                    <Text className={`text-[10px] font-black uppercase ${attendanceStatus === s ? "text-white" : "text-gray-500"}`}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Optional notes..."
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-[52px] rounded-xl items-center justify-center shadow-lg flex-row gap-2 mt-8"
            style={{ backgroundColor: Colors.primary }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update Record" : "Mark Attendance"}
              </Text>
            )}
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
