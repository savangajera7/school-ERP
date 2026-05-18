import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

// Mock data
const CLASSES = ["Class I", "Class II", "Class III", "Class IV"];
const SECTIONS = ["A", "B", "C"];

const MOCK_STUDENTS = [
  { id: "stu_1", name: "Pooja Patel", rollNo: "1", parentMobile: "9876543255", status: "present" },
  { id: "stu_2", name: "Rahul Sharma", rollNo: "2", parentMobile: "9823412345", status: "present" },
  { id: "stu_3", name: "Aarav Desai", rollNo: "3", parentMobile: "9988776655", status: "absent" },
  { id: "stu_4", name: "Riya Singh", rollNo: "4", parentMobile: "9123456789", status: "present" },
  { id: "stu_5", name: "Kavya Verma", rollNo: "5", parentMobile: "9988771122", status: "late" },
];

export default function AttendanceScreen() {
  const { isMobile } = useBreakpoint();
  const [selectedClass, setSelectedClass] = useState("Class I");
  const [selectedSection, setSelectedSection] = useState("A");
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  
  // Local state for attendance toggles
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const toggleStatus = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: "present" })));
  };

  const handleSave = () => {
    const absentCount = students.filter(s => s.status === 'absent').length;
    if (Platform.OS !== 'web') {
      Alert.alert(
        "Attendance Saved", 
        `${students.length} records saved. ${absentCount} students are marked absent. Would you like to send WhatsApp alerts?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Send Alerts", onPress: () => console.log("Sending WhatsApp Alerts...") }
        ]
      );
    } else {
      window.alert(`Attendance Saved!\n${absentCount} students marked absent.`);
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
            <Text className="text-[18px] font-bold text-gray-900">Daily Attendance</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              Log presence and send alerts
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          className="px-4 py-2 bg-[#f5921e] rounded-lg flex-row items-center gap-2 shadow-sm shadow-orange-100"
        >
          <Text className="text-xs font-bold text-white">💾 Save & Sync</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Configuration Card */}
          <Card className="bg-white border border-gray-100 p-5 mb-6">
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center justify-between"}`}>
              
              <View className="flex-row gap-4 flex-1">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Select Class</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {CLASSES.map((cls) => (
                      <TouchableOpacity
                        key={cls}
                        onPress={() => setSelectedClass(cls)}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedClass === cls ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                        }`}
                      >
                        <Text className={`text-sm font-bold ${selectedClass === cls ? "text-white" : "text-gray-700"}`}>
                          {cls}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Section</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {SECTIONS.map((sec) => (
                      <TouchableOpacity
                        key={sec}
                        onPress={() => setSelectedSection(sec)}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedSection === sec ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                        }`}
                      >
                        <Text className={`text-sm font-bold ${selectedSection === sec ? "text-white" : "text-gray-700"}`}>
                          {sec}
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
                {selectedClass} - {selectedSection}
              </Text>
              <Text className="text-xs text-gray-500 font-semibold mt-1">
                {students.filter(s => s.status === 'present').length} Present • {students.filter(s => s.status === 'absent').length} Absent
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
            {students.map((student, index) => (
              <View 
                key={student.id} 
                className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
              >
                <Text className="w-12 text-sm font-bold text-gray-400">{student.rollNo}</Text>
                
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center">
                    <Text className="text-sm">👤</Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-800">{student.name}</Text>
                </View>

                {!isMobile && (
                  <View className="w-[120px] items-center">
                    <View className={`px-2.5 py-1 rounded-full ${
                      student.status === 'present' ? 'bg-green-50' : 
                      student.status === 'absent' ? 'bg-red-50' : 'bg-orange-50'
                    }`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'present' ? 'text-green-700' : 
                        student.status === 'absent' ? 'text-red-700' : 'text-orange-700'
                      }`}>
                        {student.status}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Toggles */}
                <View className="w-[180px] flex-row justify-end gap-2">
                  <TouchableOpacity 
                    onPress={() => toggleStatus(student.id, 'present')}
                    className={`w-[36px] h-[36px] rounded-lg items-center justify-center border ${
                      student.status === 'present' 
                        ? 'bg-green-500 border-green-600 shadow-sm shadow-green-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${student.status === 'present' ? 'text-white' : 'text-gray-400'}`}>P</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => toggleStatus(student.id, 'absent')}
                    className={`w-[36px] h-[36px] rounded-lg items-center justify-center border ${
                      student.status === 'absent' 
                        ? 'bg-red-500 border-red-600 shadow-sm shadow-red-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${student.status === 'absent' ? 'text-white' : 'text-gray-400'}`}>A</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => toggleStatus(student.id, 'late')}
                    className={`w-[36px] h-[36px] rounded-lg items-center justify-center border ${
                      student.status === 'late' 
                        ? 'bg-[#f5921e] border-orange-500 shadow-sm shadow-orange-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${student.status === 'late' ? 'text-white' : 'text-gray-400'}`}>L</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
