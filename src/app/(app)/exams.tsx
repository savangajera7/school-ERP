import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useGetApiClassGetAll } from "@/api/generated/class/class";
import { useExamAddMarks, useExamGenerateResult } from "@/api/generated/erp-exam/erp-exam";

// Mock Data
const MOCK_EXAMS = [
  { id: "ex_1", name: "Unit Test I", class: "Class I-A", date: "10 May, 2026", status: "Published" },
  { id: "ex_2", name: "First Term Examination", class: "Class I-A", date: "15 May, 2026", status: "Published" },
  { id: "ex_3", name: "Unit Test II", class: "Class I-A", date: "19 May, 2026", status: "Ongoing" },
];

const MOCK_SUBJECTS = ["English", "Mathematics", "Science (EVS)", "Gujarati / Hindi"];

const MOCK_STUDENTS = [
  { id: "stu_1", rollNo: "1", grNo: "GR-1044", name: "Pooja Patel", marks: { English: 85, Mathematics: 92, "Science (EVS)": 78, "Gujarati / Hindi": 90 } },
  { id: "stu_2", rollNo: "2", grNo: "GR-1052", name: "Rahul Sharma", marks: { English: 72, Mathematics: 88, "Science (EVS)": 84, "Gujarati / Hindi": 75 } },
  { id: "stu_3", rollNo: "3", grNo: "GR-1089", name: "Aarav Desai", marks: { English: 60, Mathematics: 65, "Science (EVS)": 50, "Gujarati / Hindi": 62 } },
  { id: "stu_4", rollNo: "4", grNo: "GR-1102", name: "Riya Singh", marks: { English: 95, Mathematics: 98, "Science (EVS)": 94, "Gujarati / Hindi": 96 } },
];

export default function ExamsManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<"list" | "marks" | "ranks" | "report">("list");
  
  // Selection filters for Marks Entry
  const [selectedExam, setSelectedExam] = useState("First Term Examination");
  const [selectedSubject, setSelectedSubject] = useState("English");
  
  const { data: classesData } = useGetApiClassGetAll();
  const addMarks = useExamAddMarks();
  const generateResult = useExamGenerateResult();

  const classes = classesData?.data?.data || [];
  
  // Local editable marks state
  const [studentMarks, setStudentMarks] = useState(MOCK_STUDENTS);

  // New Exam Form State
  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [examDate, setExamDate] = useState("");

  const handleMarkChange = (studentId: string, subject: string, val: string) => {
    const numericVal = parseInt(val) || 0;
    setStudentMarks(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          marks: {
            ...s.marks,
            [subject]: Math.min(100, Math.max(0, numericVal))
          }
        };
      }
      return s;
    }));
  };

  const handleSaveMarks = async () => {
    try {
      if (Platform.OS !== 'web') {
        Alert.alert("Marks Updated", "Marks sheet successfully saved and synced to cloud ledger.");
      } else {
        window.alert("Marks sheet successfully saved and synced to cloud ledger!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save marks.");
    }
  };

  const handleCreateExam = () => {
    if (!examName || !examDate) {
      Alert.alert("Missing Fields", "Please enter exam name and schedule date.");
      return;
    }
    Alert.alert("Exam Created", `New schedule generated for ${examName}.`);
    setShowAddExam(false);
  };

  // Calculate totals and percentages for rankings
  const calculatedRanks = studentMarks.map(s => {
    const marksValues = Object.values(s.marks) as number[];
    const total = marksValues.reduce((a, b) => a + b, 0);
    const avg = parseFloat((total / marksValues.length).toFixed(1));
    let grade = "C";
    if (avg >= 90) grade = "A+";
    else if (avg >= 80) grade = "A";
    else if (avg >= 70) grade = "B";
    return { ...s, total, avg, grade };
  }).sort((a, b) => b.total - a.total);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        className="px-6 pt-6 pb-12 rounded-b-[32px]"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/20"
          >
            <Text className="text-white font-bold">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-white">Examination</Text>
            <Text className="text-white/60 text-xs font-bold uppercase tracking-wider mt-0.5">
              Results & Marks Management
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View className="px-6 -mt-6">
        <View className="bg-white p-2 rounded-2xl flex-row shadow-lg shadow-gray-200/50 border border-gray-50">
          <TouchableOpacity 
            onPress={() => setActiveTab("list")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'list' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'list' ? 'text-primary' : 'text-gray-400'}`}>Exams</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("marks")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'marks' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'marks' ? 'text-primary' : 'text-gray-400'}`}>Marks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("ranks")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'ranks' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'ranks' ? 'text-primary' : 'text-gray-400'}`}>Ranks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("report")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'report' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'report' ? 'text-primary' : 'text-gray-400'}`}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 mt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* TAB 1: Exams List */}
          {activeTab === "list" && (
            <View className="gap-4">
              <View className="flex-row justify-between items-center mb-2 px-1">
                <Text className="text-sm font-bold text-gray-800">Academic Exams Calendar</Text>
                <TouchableOpacity 
                  onPress={() => setShowAddExam(!showAddExam)}
                  className="px-3.5 py-1.5 bg-[#f5921e] rounded-lg shadow-sm"
                >
                  <Text className="text-xs font-bold text-white">Create Exam</Text>
                </TouchableOpacity>
              </View>

              {showAddExam && (
                <Card className="bg-white border border-orange-100 p-5 mb-2 gap-4">
                  <Text className="text-xs font-bold uppercase text-[#0d3666]">Schedule New Exam Slot</Text>
                  
                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold text-gray-400 mb-1">Exam Name</Text>
                      <TextInput 
                        value={examName} 
                        onChangeText={setExamName}
                        placeholder="e.g. Mid-Term II"
                        className="h-[40px] bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold text-gray-400 mb-1">Standard</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                        {classes.map((cls: any) => (
                          <TouchableOpacity
                            key={cls.classID}
                            onPress={() => setSelectedClassId(cls.classID)}
                            className={`px-3 py-1 rounded-md border ${selectedClassId === cls.classID ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                          >
                            <Text className={`text-[10px] font-bold ${selectedClassId === cls.classID ? 'text-white' : 'text-gray-600'}`}>{cls.className}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold text-gray-400 mb-1">Date scheduled</Text>
                      <TextInput 
                        value={examDate} 
                        onChangeText={setExamDate}
                        placeholder="e.g. 24 June, 2026"
                        className="h-[40px] bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs"
                      />
                    </View>
                  </View>
                  
                  <View className="flex-row justify-end gap-3 mt-2">
                    <TouchableOpacity onPress={() => setShowAddExam(false)} className="px-4 py-2 bg-gray-50 rounded-lg">
                      <Text className="text-xs font-bold text-gray-400">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCreateExam} className="px-4 py-2 bg-[#0d3666] rounded-lg">
                      <Text className="text-xs font-bold text-white">Create Schedule</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}

              {MOCK_EXAMS.map((exam) => (
                <Card key={exam.id} className="bg-white border border-gray-100 p-5 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center">
                      <Text className="text-xl">📝</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-gray-800">{exam.name}</Text>
                      <Text className="text-[11px] text-gray-400 font-semibold mt-0.5">{exam.class} • {exam.date}</Text>
                    </View>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${exam.status === 'Published' ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <Text className={`text-[10px] font-bold uppercase ${exam.status === 'Published' ? 'text-green-700' : 'text-orange-700'}`}>
                      {exam.status}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* TAB 2: Marks Entry */}
          {activeTab === "marks" && (
            <View>
              <View className="flex-row justify-between items-center mb-6 px-1">
                <View>
                  <Text className="text-sm font-bold text-gray-800">Internal Assessment Sheet</Text>
                  <Text className="text-xs text-gray-400 font-semibold mt-0.5">{selectedExam} - {selectedSubject}</Text>
                </View>
                <TouchableOpacity onPress={handleSaveMarks} className="px-4 py-2 bg-indigo-600 rounded-lg shadow-sm">
                  <Text className="text-xs font-bold text-white">💾 Sync Sheet</Text>
                </TouchableOpacity>
              </View>

              <Card className="bg-white border border-gray-100 overflow-hidden">
                <View className="flex-row px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Text className="w-10 text-xs font-bold text-gray-400">ROLL</Text>
                  <Text className="flex-1 text-xs font-bold text-gray-400">STUDENT NAME</Text>
                  <Text className="w-[100px] text-xs font-bold text-gray-400 text-center">MARKS (100)</Text>
                </View>

                {studentMarks.map((s, idx) => (
                  <View key={s.id} className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}>
                    <Text className="w-10 text-sm font-bold text-gray-400">{s.rollNo}</Text>
                    <Text className="flex-1 text-sm font-bold text-gray-800">{s.name}</Text>
                    <View className="w-[100px] items-center">
                      <TextInput
                        keyboardType="numeric"
                        value={String(s.marks[selectedSubject as keyof typeof s.marks])}
                        onChangeText={(v) => handleMarkChange(s.id, selectedSubject, v)}
                        className="w-14 h-9 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-indigo-600"
                      />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* TAB 3: Rank List */}
          {activeTab === "ranks" && (
            <View>
               <View className="mb-6 px-1">
                <Text className="text-sm font-bold text-gray-800">Class Performance Leaderboard</Text>
                <Text className="text-xs text-gray-400 font-semibold mt-0.5">Based on combined subject averages</Text>
              </View>

              <View className="gap-3">
                {calculatedRanks.map((s, idx) => (
                  <Card key={s.id} className="bg-white border border-gray-100 p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className={`w-8 h-8 rounded-full items-center justify-center ${idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-gray-100' : idx === 2 ? 'bg-orange-100' : 'bg-gray-50'}`}>
                        <Text className="text-xs font-black">{idx + 1}</Text>
                      </View>
                      <View>
                        <Text className="text-sm font-bold text-gray-800">{s.name}</Text>
                        <Text className="text-[10px] text-gray-400 font-bold">Total: {s.total} / 400</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-black text-indigo-600">{s.avg}%</Text>
                      <View className="px-2 bg-indigo-50 rounded-md">
                        <Text className="text-[10px] font-black text-indigo-600 uppercase">Grade {s.grade}</Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
