import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useGetApiClassGetAll } from "@/api/generated/class/class";
import { useGetApiSectionGetAll } from "@/api/generated/section/section";
import { useGetApiStudentGetAllStudents } from "@/api/generated/student/student";
import { useAttendanceMarkStudent } from "@/api/generated/erp-attendance/erp-attendance";
import { StudentModel } from "@/api/model/studentModel";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

export default function AttendanceScreen() {
  const { isMobile } = useBreakpoint();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  
  // API Hooks
  const { data: classesData, isLoading: loadingClasses } = useGetApiClassGetAll();
  const { data: sectionsData, isLoading: loadingSections } = useGetApiSectionGetAll();
  const { data: studentsData, isLoading: loadingStudents } = useGetApiStudentGetAllStudents();
  const markAttendance = useAttendanceMarkStudent();

  const classes = useMemo(() => classesData?.data?.data || [], [classesData]);
  const sections = useMemo(() => sectionsData?.data?.data || [], [sectionsData]);
  
  // Local state for attendance statuses (studentID -> status)
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});

  const filteredStudents = useMemo(() => {
    if (!studentsData?.data?.data) return [];
    return (studentsData.data.data as StudentModel[]).filter(s => 
      (!selectedClassId || s.classID === selectedClassId) &&
      (!selectedSectionId || s.sectionID === selectedSectionId)
    );
  }, [studentsData, selectedClassId, selectedSectionId]);

  const toggleStatus = (studentId: number, newStatus: string) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: newStatus }));
  };

  const markAllPresent = () => {
    const newMap: Record<number, string> = {};
    filteredStudents.forEach(s => {
      if (s.studentID) newMap[s.studentID] = "Present";
    });
    setAttendanceMap(prev => ({ ...prev, ...newMap }));
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      Alert.alert("Selection Required", "Please select a class first.");
      return;
    }

    try {
      const promises = filteredStudents.map(student => {
        if (!student.studentID) return Promise.resolve();
        return markAttendance.mutateAsync({
          data: {
            attendanceDate: date,
            classId: selectedClassId,
            sectionId: selectedSectionId,
            personId: student.studentID,
            status: attendanceMap[student.studentID] || "Present",
            remarks: "",
          }
        });
      });

      await Promise.all(promises);
      
      const absentCount = filteredStudents.filter(s => attendanceMap[s.studentID!] === 'Absent').length;
      const successMsg = `${filteredStudents.length} records synchronized successfully. ${absentCount} marked absent.`;
      
      if (Platform.OS !== 'web') {
        Alert.alert("Attendance Synced", successMsg);
      } else {
        window.alert(`Attendance Synced!\n${successMsg}`);
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      Alert.alert("Synchronization Error", "Failed to upload daily logs.");
    }
  };

  if (loadingClasses || loadingSections) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <PremiumLoader color={Colors.primary} size={40} />
      </View>
    );
  }

  const selectedClassName = classes.find((c: any) => c.classID === selectedClassId)?.className || "Select Class";
  const selectedSectionName = sections.find((s: any) => s.sectionID === selectedSectionId)?.sectionName || "Select Section";

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <ScreenHeader 
        title="Daily Attendance" 
        subtitle="Log student presence & sync logs"
        onBack={() => router.push("/(app)/dashboard")}
        rightAction={
          <TouchableOpacity 
            onPress={handleSave}
            disabled={markAttendance.isPending}
            className={`px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 border border-white/20 ${
              markAttendance.isPending ? 'bg-white/10' : 'bg-orange-500'
            }`}
            activeOpacity={0.8}
          >
            {markAttendance.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">✓ Sync Logs</Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-4 mt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Configuration Card */}
          <Card className="bg-white border border-gray-150 p-5 mb-6">
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center justify-between"}`}>
              
              <View className="flex-row gap-4 flex-1">
                <View className="flex-1">
                  <Text className="text-[12px] font-black text-gray-405 mb-3 uppercase tracking-wider">Select Standard</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {classes.map((cls: any) => (
                      <TouchableOpacity
                        key={cls.classID}
                        onPress={() => setSelectedClassId(cls.classID!)}
                        className={`px-4 py-2.5 rounded-xl border-[1.5px] ${
                          selectedClassId === cls.classID 
                            ? "bg-[#0d3666] border-[#0d3666]" 
                            : "bg-gray-50/50 border-gray-200"
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-xs font-black uppercase tracking-wider ${
                          selectedClassId === cls.classID ? "text-white" : "text-gray-500"
                        }`}>
                          {cls.className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View className="flex-1">
                  <Text className="text-[12px] font-black text-gray-405 mb-3 uppercase tracking-wider">Select Section</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {sections.map((sec: any) => (
                      <TouchableOpacity
                        key={sec.sectionID}
                        onPress={() => setSelectedSectionId(sec.sectionID!)}
                        className={`px-4 py-2.5 rounded-xl border-[1.5px] ${
                          selectedSectionId === sec.sectionID 
                            ? "bg-[#0d3666] border-[#0d3666]" 
                            : "bg-gray-50/50 border-gray-200"
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-xs font-black uppercase tracking-wider ${
                          selectedSectionId === sec.sectionID ? "text-white" : "text-gray-500"
                        }`}>
                          {sec.sectionName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View className={`${isMobile ? "w-full border-t border-gray-100 pt-4" : "w-[200px] border-l border-gray-150 pl-6"}`}>
                <Text className="text-[12px] font-black text-gray-405 mb-3 uppercase tracking-wider">Effective Date</Text>
                <View className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl justify-center px-4">
                  <Text className="text-sm font-black text-gray-800">📅 {date}</Text>
                </View>
              </View>

            </View>
          </Card>

          {/* List Header */}
          <View className="flex-row justify-between items-end mb-4 px-1">
            <View>
              <Text className="text-[16px] font-black text-gray-900">
                {selectedClassName} - {selectedSectionName}
              </Text>
              <Text className="text-[12px] text-gray-400 font-bold mt-1">
                {filteredStudents.filter(s => attendanceMap[s.studentID!] === 'Present').length} Present • {filteredStudents.filter(s => attendanceMap[s.studentID!] === 'Absent').length} Absent
              </Text>
            </View>
            <TouchableOpacity 
              onPress={markAllPresent} 
              className="flex-row items-center gap-1.5 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100"
              activeOpacity={0.8}
            >
              <Text className="text-xs font-black text-emerald-700 uppercase tracking-wider">✓ Mark All Present</Text>
            </TouchableOpacity>
          </View>

          {/* Student List Matrix */}
          <Card noPadding className="bg-white border border-gray-100 overflow-hidden shadow-md">
            {/* Header Row */}
            <View className="flex-row items-center px-5 py-4 bg-gray-50 border-b border-gray-150">
              <Text className="w-12 text-xs font-black text-gray-400 uppercase">Roll</Text>
              <Text className="flex-1 text-xs font-black text-gray-400 uppercase">Student Name</Text>
              {!isMobile && <Text className="w-[120px] text-xs font-black text-gray-400 uppercase text-center">Status</Text>}
              <Text className="w-[160px] text-xs font-black text-gray-400 uppercase text-right">Actions</Text>
            </View>

            {/* Rows */}
            {loadingStudents ? (
              <View className="py-20">
                <PremiumLoader color={Colors.primary} size={30} />
              </View>
            ) : filteredStudents.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Text className="text-3xl mb-3">👧🏻👦🏻</Text>
                <Text className="text-gray-400 font-black text-sm uppercase tracking-wider">No students matching criteria</Text>
              </View>
            ) : (
              filteredStudents.map((student, index) => (
                <View 
                  key={student.studentID} 
                  className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                  }`}
                >
                  <Text className="w-12 text-sm font-extrabold text-gray-400">{student.rollNo || '-'}</Text>
                  
                  <View className="flex-1 flex-row items-center gap-3.5">
                    <View className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center">
                      <Text className="text-sm">{student.gender === 'Female' ? '👧🏻' : '👦🏻'}</Text>
                    </View>
                    <Text className="text-sm font-extrabold text-gray-850">
                      {student.studentDisplayName || `${student.firstName} ${student.lastName}`}
                    </Text>
                  </View>

                  {!isMobile && (
                    <View className="w-[120px] items-center">
                      <View className={`px-3 py-1 rounded-full ${
                        attendanceMap[student.studentID!] === 'Present' ? 'bg-emerald-50 border border-emerald-100' : 
                        attendanceMap[student.studentID!] === 'Absent' ? 'bg-rose-50 border border-rose-100' : 'bg-orange-50 border border-orange-100'
                      }`}>
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${
                          attendanceMap[student.studentID!] === 'Present' ? 'text-emerald-600' : 
                          attendanceMap[student.studentID!] === 'Absent' ? 'text-rose-600' : 'text-orange-600'
                        }`}>
                          {attendanceMap[student.studentID!] || 'Pending'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Actions (P, A, L buttons) */}
                  <View className="w-[160px] flex-row justify-end gap-2">
                    <TouchableOpacity 
                      onPress={() => toggleStatus(student.studentID!, 'Present')}
                      className={`w-[36px] h-[36px] rounded-xl items-center justify-center border ${
                        attendanceMap[student.studentID!] === 'Present' 
                          ? 'bg-[#10B981] border-[#10B981] shadow-sm shadow-emerald-100' 
                          : 'bg-white border-gray-200'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-black ${
                        attendanceMap[student.studentID!] === 'Present' ? 'text-white' : 'text-gray-400'
                      }`}>P</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => toggleStatus(student.studentID!, 'Absent')}
                      className={`w-[36px] h-[36px] rounded-xl items-center justify-center border ${
                        attendanceMap[student.studentID!] === 'Absent' 
                          ? 'bg-rose-500 border-rose-500 shadow-sm shadow-rose-150' 
                          : 'bg-white border-gray-200'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-black ${
                        attendanceMap[student.studentID!] === 'Absent' ? 'text-white' : 'text-gray-400'
                      }`}>A</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => toggleStatus(student.studentID!, 'Late')}
                      className={`w-[36px] h-[36px] rounded-xl items-center justify-center border ${
                        attendanceMap[student.studentID!] === 'Late' 
                          ? 'bg-[#f5921e] border-[#f5921e] shadow-sm shadow-orange-150' 
                          : 'bg-white border-gray-200'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-black ${
                        attendanceMap[student.studentID!] === 'Late' ? 'text-white' : 'text-gray-400'
                      }`}>L</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
