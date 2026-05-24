import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, FlatList } from "react-native";
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
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";

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

  const selectedClassName = classes.find((c: any) => c.classID === selectedClassId)?.className || "Select Class";
  const selectedSectionName = sections.find((s: any) => s.sectionID === selectedSectionId)?.sectionName || "Select Section";

  const renderStudentItemMobile = ({ item }: { item: StudentModel }) => {
    const fullName = item.studentDisplayName || `${item.firstName} ${item.lastName}`;
    const status = attendanceMap[item.studentID!] || "Pending";

    const badgeColor = 
      status === "Present" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
      status === "Absent" ? "bg-rose-50 border-rose-200 text-rose-600" :
      status === "Late" ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-gray-50 border-gray-150 text-gray-400";

    const stripeColor = 
      status === "Present" ? Colors.success :
      status === "Absent" ? Colors.error :
      status === "Late" ? Colors.accent : Colors.border;

    return (
      <MobileDataCard
        key={item.studentID}
        title={fullName}
        subtitle={`Roll No: ${item.rollNo || "N/A"}`}
        accentColor={stripeColor}
        icon={
          <View className="w-10 h-10 rounded-xl items-center justify-center bg-gray-50 border border-gray-100">
            <Text className="text-lg">{item.gender === "Female" ? "👧🏻" : "👦🏻"}</Text>
          </View>
        }
        badge={
          <View className={`px-2.5 py-0.5 rounded-lg border ${badgeColor.split(" ")[0]} ${badgeColor.split(" ")[1]}`}>
            <Text className={`text-[9px] font-black uppercase tracking-wider ${badgeColor.split(" ")[2]}`}>
              {status}
            </Text>
          </View>
        }
        actions={
          <View className="flex-1 flex-row justify-end gap-2 pt-1 border-t border-gray-50">
            <TouchableOpacity 
              onPress={() => toggleStatus(item.studentID!, 'Present')}
              className={`px-3 py-1.5 rounded-xl border flex-1 items-center justify-center ${
                status === 'Present' 
                  ? 'bg-emerald-550 border-emerald-550 bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text className={`text-xs font-black uppercase tracking-wide ${status === 'Present' ? 'text-white' : 'text-gray-400'}`}>P</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => toggleStatus(item.studentID!, 'Absent')}
              className={`px-3 py-1.5 rounded-xl border flex-1 items-center justify-center ${
                status === 'Absent' 
                  ? 'bg-red-600 border-red-600 text-white' 
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text className={`text-xs font-black uppercase tracking-wide ${status === 'Absent' ? 'text-white' : 'text-gray-400'}`}>A</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => toggleStatus(item.studentID!, 'Late')}
              className={`px-3 py-1.5 rounded-xl border flex-1 items-center justify-center ${
                status === 'Late' 
                  ? 'bg-amber-500 border-amber-500 text-white' 
                  : 'bg-white border-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text className={`text-xs font-black uppercase tracking-wide ${status === 'Late' ? 'text-white' : 'text-gray-400'}`}>L</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <ScreenHeader 
        title="Daily Attendance" 
        subtitle="Log student presence & sync logs"
        breadcrumb={["Attendance"]}
        onBack={() => router.push("/(app)/dashboard")}
        rightAction={
          <TouchableOpacity 
            onPress={handleSave}
            disabled={markAttendance.isPending}
            className={`px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 shadow-md ${
              markAttendance.isPending ? 'bg-white/10' : 'bg-[#F5921E] shadow-amber-500/20'
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

      <View className="flex-1 px-4 md:px-8 max-w-[1400px] w-full self-center">
        {/* Configuration Card */}
        <Card className="bg-white border border-gray-150 p-5 mt-6 mb-6">
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
                          ? "bg-[#134A8C] border-[#134A8C]" 
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
                          ? "bg-[#134A8C] border-[#134A8C]" 
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
              <Text className="text-[12px] font-black text-gray-450 mb-3 uppercase tracking-wider">Effective Date</Text>
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
            className="flex-row items-center gap-1.5 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm shadow-emerald-500/5"
            activeOpacity={0.8}
          >
            <Text className="text-xs font-black text-emerald-700 uppercase tracking-wider">✓ Mark All Present</Text>
          </TouchableOpacity>
        </View>

        {/* Student List Matrix */}
        {loadingStudents || loadingClasses || loadingSections ? (
          <View className="py-6">
            <SkeletonLoader variant={isMobile ? "card" : "table"} rows={5} />
          </View>
        ) : isMobile ? (
          /* Mobile Card List */
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItemMobile}
            keyExtractor={(item) => item.studentID?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 bg-white rounded-3xl border border-gray-150 mt-2">
                <Text className="text-4xl mb-4">👧🏻👦🏻</Text>
                <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                  No students found
                </Text>
              </View>
            }
          />
        ) : (
          /* Desktop Table View inside Card */
          <Card noPadding className="bg-white border border-gray-150 overflow-hidden shadow-sm">
            {/* Header Row */}
            <View className="flex-row items-center px-6 py-4 bg-gray-50 border-b border-gray-150">
              <Text className="w-16 text-xs font-black text-gray-450 uppercase">Roll</Text>
              <Text className="flex-1 text-xs font-black text-gray-450 uppercase">Student Name</Text>
              <Text className="w-[120px] text-xs font-black text-gray-450 uppercase text-center">Status</Text>
              <Text className="w-[180px] text-xs font-black text-gray-450 uppercase text-right">Actions</Text>
            </View>

            {/* Rows */}
            {filteredStudents.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Text className="text-3xl mb-3">📭</Text>
                <Text className="text-gray-400 font-black text-sm uppercase tracking-wider">No students matching criteria</Text>
              </View>
            ) : (
              filteredStudents.map((student, index) => {
                const status = attendanceMap[student.studentID!] || "Pending";
                return (
                  <View 
                    key={student.studentID} 
                    className={`flex-row items-center px-6 py-3.5 border-b border-gray-100 hover:bg-gray-50/50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                    }`}
                  >
                    <Text className="w-16 text-sm font-extrabold text-gray-400">{student.rollNo || '-'}</Text>
                    
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-lg bg-indigo-50/50 border border-indigo-100 items-center justify-center">
                        <Text className="text-sm">{student.gender === 'Female' ? '👧🏻' : '👦🏻'}</Text>
                      </View>
                      <Text className="text-sm font-black text-gray-900">
                        {student.studentDisplayName || `${student.firstName} ${student.lastName}`}
                      </Text>
                    </View>

                    <View className="w-[120px] items-center">
                      <View className={`px-3 py-1 rounded-full border ${
                        status === 'Present' ? 'bg-emerald-50 border-emerald-100' : 
                        status === 'Absent' ? 'bg-rose-50 border-rose-100' : 
                        status === 'Late' ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'
                      }`}>
                        <Text className={`text-[9px] font-black uppercase tracking-widest ${
                          status === 'Present' ? 'text-emerald-700' : 
                          status === 'Absent' ? 'text-rose-700' : 
                          status === 'Late' ? 'text-amber-700' : 'text-gray-400'
                        }`}>
                          {status}
                        </Text>
                      </View>
                    </View>

                    {/* Actions (P, A, L buttons) */}
                    <View className="w-[180px] flex-row justify-end gap-2">
                      <TouchableOpacity 
                        onPress={() => toggleStatus(student.studentID!, 'Present')}
                        className={`w-[36px] h-[36px] rounded-xl items-center justify-center border ${
                          status === 'Present' 
                            ? 'bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-xs font-black ${
                          status === 'Present' ? 'text-white' : 'text-gray-400'
                        }`}>P</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => toggleStatus(student.studentID!, 'Absent')}
                        className={`w-[36px] h-[36px] rounded-xl items-center justify-center border ${
                          status === 'Absent' 
                            ? 'bg-red-500 border-red-500 shadow-sm shadow-rose-150' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-xs font-black ${
                          status === 'Absent' ? 'text-white' : 'text-gray-400'
                        }`}>A</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => toggleStatus(student.studentID!, 'Late')}
                        className={`w-[36px] h-[36px] rounded-xl items-center justify-center border ${
                          status === 'Late' 
                            ? 'bg-[#f5921e] border-[#f5921e] shadow-sm shadow-orange-150' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-xs font-black ${
                          status === 'Late' ? 'text-white' : 'text-gray-400'
                        }`}>L</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}
