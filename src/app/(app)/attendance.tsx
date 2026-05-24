import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform, ActivityIndicator } from "react-native";
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
import { LinearGradient } from "expo-linear-gradient";

export default function AttendanceScreen() {
  const { isMobile } = useBreakpoint();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
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
      Alert.alert("Error", "Please select a class first.");
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
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Attendance Saved", 
          `${filteredStudents.length} records saved. ${absentCount} students are marked absent.`,
          [{ text: "OK" }]
        );
      } else {
        window.alert(`Attendance Saved!\n${absentCount} students marked absent.`);
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      Alert.alert("Error", "Failed to save attendance records.");
    }
  };

  if (loadingClasses || loadingSections) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0d3666" />
      </View>
    );
  }

  const selectedClassName = classes.find((c: any) => c.classID === selectedClassId)?.className || "Select Class";
  const selectedSectionName = sections.find((s: any) => s.sectionID === selectedSectionId)?.sectionName || "Select Section";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        className="px-6 pt-6 pb-12 rounded-b-[32px]"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => router.push("/(app)/dashboard")}
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/20"
            >
              <Text className="text-white font-bold">🔙</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-black text-white">Daily Attendance</Text>
              <Text className="text-white/60 text-xs font-bold uppercase tracking-wider mt-0.5">
                Log presence and sync
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={markAttendance.isPending}
            className={`px-5 py-3 rounded-2xl flex-row items-center gap-2 shadow-lg ${markAttendance.isPending ? 'bg-gray-400' : 'bg-accent shadow-accent/20'}`}
          >
            {markAttendance.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold uppercase text-xs tracking-widest">Sync</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 -mt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Configuration Card */}
          <Card className="bg-white border border-gray-100 p-5 mb-6">
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center justify-between"}`}>
              
              <View className="flex-row gap-4 flex-1">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Select Class</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {classes.map((cls: any) => (
                      <TouchableOpacity
                        key={cls.classID}
                        onPress={() => setSelectedClassId(cls.classID!)}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedClassId === cls.classID ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                        }`}
                      >
                        <Text className={`text-sm font-bold ${selectedClassId === cls.classID ? "text-white" : "text-gray-700"}`}>
                          {cls.className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Section</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {sections.map((sec: any) => (
                      <TouchableOpacity
                        key={sec.sectionID}
                        onPress={() => setSelectedSectionId(sec.sectionID!)}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedSectionId === sec.sectionID ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                        }`}
                      >
                        <Text className={`text-sm font-bold ${selectedSectionId === sec.sectionID ? "text-white" : "text-gray-700"}`}>
                          {sec.sectionName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View className={`${isMobile ? "w-full border-t border-gray-100 pt-4" : "w-[200px] border-l border-gray-100 pl-6"}`}>
                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Date</Text>
                <View className="h-[38px] bg-gray-50 border border-gray-100 rounded-lg justify-center px-4">
                  <Text className="text-sm font-bold text-gray-800">📅 {date}</Text>
                </View>
              </View>

            </View>
          </Card>

          {/* List Header */}
          <View className="flex-row justify-between items-end mb-4 px-1">
            <View>
              <Text className="text-lg font-bold text-gray-800">
                {selectedClassName} - {selectedSectionName}
              </Text>
              <Text className="text-xs text-gray-500 font-semibold mt-1">
                {filteredStudents.filter(s => attendanceMap[s.studentID!] === 'Present').length} Present • {filteredStudents.filter(s => attendanceMap[s.studentID!] === 'Absent').length} Absent
              </Text>
            </View>
            <TouchableOpacity onPress={markAllPresent} className="flex-row items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
              <Text className="text-xs font-bold text-green-700">✓ Mark All Present</Text>
            </TouchableOpacity>
          </View>

          {/* Student List Matrix */}
          <Card className="bg-white border border-gray-100 overflow-hidden">
            {/* Header Row */}
            <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
              <Text className="w-12 text-xs font-bold text-gray-400 uppercase">Roll</Text>
              <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Student Name</Text>
              {!isMobile && <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-center">Status</Text>}
              <Text className="w-[180px] text-xs font-bold text-gray-400 uppercase text-center">Actions</Text>
            </View>

            {/* Rows */}
            {loadingStudents ? (
              <View className="py-10">
                <ActivityIndicator color="#0d3666" />
              </View>
            ) : filteredStudents.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-gray-400 font-bold">No students found for this selection.</Text>
              </View>
            ) : (
              filteredStudents.map((student, index) => (
                <View 
                  key={student.studentID} 
                  className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                >
                  <Text className="w-12 text-sm font-bold text-gray-400">{student.rollNo || '-'}</Text>
                  
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center">
                      <Text className="text-sm">{student.gender === 'Female' ? '👧🏻' : '👦🏻'}</Text>
                    </View>
                    <Text className="text-sm font-bold text-gray-800">
                      {student.studentDisplayName || `${student.firstName} ${student.lastName}`}
                    </Text>
                  </View>

                  {!isMobile && (
                    <View className="w-[120px] items-center">
                      <View className={`px-2.5 py-1 rounded-full ${
                        attendanceMap[student.studentID!] === 'Present' ? 'bg-green-50' : 
                        attendanceMap[student.studentID!] === 'Absent' ? 'bg-red-50' : 'bg-orange-50'
                      }`}>
                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                          attendanceMap[student.studentID!] === 'Present' ? 'text-green-700' : 
                          attendanceMap[student.studentID!] === 'Absent' ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          {attendanceMap[student.studentID!] || 'Pending'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Toggles */}
                  <View className="w-[180px] flex-row justify-end gap-2">
                    <TouchableOpacity 
                      onPress={() => toggleStatus(student.studentID!, 'Present')}
                      className={`w-[36px] h-[36px] rounded-lg items-center justify-center border ${
                        attendanceMap[student.studentID!] === 'Present' 
                          ? 'bg-green-500 border-green-600 shadow-sm shadow-green-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-bold ${attendanceMap[student.studentID!] === 'Present' ? 'text-white' : 'text-gray-400'}`}>P</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => toggleStatus(student.studentID!, 'Absent')}
                      className={`w-[36px] h-[36px] rounded-lg items-center justify-center border ${
                        attendanceMap[student.studentID!] === 'Absent' 
                          ? 'bg-red-500 border-red-600 shadow-sm shadow-red-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-bold ${attendanceMap[student.studentID!] === 'Absent' ? 'text-white' : 'text-gray-400'}`}>A</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => toggleStatus(student.studentID!, 'Late')}
                      className={`w-[36px] h-[36px] rounded-lg items-center justify-center border ${
                        attendanceMap[student.studentID!] === 'Late' 
                          ? 'bg-[#f5921e] border-orange-500 shadow-sm shadow-orange-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-bold ${attendanceMap[student.studentID!] === 'Late' ? 'text-white' : 'text-gray-400'}`}>L</Text>
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
