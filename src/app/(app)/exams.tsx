import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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
  
  // Local editable marks state
  const [studentMarks, setStudentMarks] = useState(MOCK_STUDENTS);

  // New Exam Form State
  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState("");
  const [examClass, setExamClass] = useState("Class I-A");
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

  const handleSaveMarks = () => {
    if (Platform.OS !== 'web') {
      Alert.alert("Marks Updated", "Marks sheet successfully saved and synced to cloud ledger.");
    } else {
      window.alert("Marks sheet successfully saved and synced to cloud ledger!");
    }
  };

  const handleCreateExam = () => {
    if (!examName || !examDate) {
      Alert.alert("Missing Fields", "Please enter exam name and schedule date.");
      return;
    }
    // Simple push simulated
    Alert.alert("Exam Created", `New schedule generated for ${examName}.`);
    setShowAddExam(false);
  };

  // Calculate totals and percentages for rankings
  const calculatedRanks = studentMarks.map(s => {
    const total = Object.values(s.marks).reduce((a, b) => a + b, 0);
    const avg = parseFloat((total / Object.keys(s.marks).length).toFixed(1));
    let grade = "C";
    if (avg >= 90) grade = "A+";
    else if (avg >= 80) grade = "A";
    else if (avg >= 70) grade = "B";
    return { ...s, total, avg, grade };
  }).sort((a, b) => b.total - a.total);

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
            <Text className="text-[18px] font-bold text-gray-900">Exam & Result Management</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              Enter academic grades, generate combined marksheets
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Wizard Sub Tabs */}
          <View className="flex-row gap-2 mb-6 border-b border-gray-100 pb-3">
            <TouchableOpacity
              onPress={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-lg ${activeTab === "list" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "list" ? "text-white" : "text-gray-600"}`}>
                📖 Exams List
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("marks")}
              className={`px-4 py-2 rounded-lg ${activeTab === "marks" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "marks" ? "text-white" : "text-gray-600"}`}>
                ✍️ Enter Marks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("ranks")}
              className={`px-4 py-2 rounded-lg ${activeTab === "ranks" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "ranks" ? "text-white" : "text-gray-600"}`}>
                🏆 Rank List
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("report")}
              className={`px-4 py-2 rounded-lg ${activeTab === "report" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "report" ? "text-white" : "text-gray-600"}`}>
                📄 Generate Marksheet
              </Text>
            </TouchableOpacity>
          </View>

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
                      <Text className="text-[11px] font-bold text-gray-400 mb-1">Target Standard</Text>
                      <TextInput 
                        value={examClass} 
                        onChangeText={setExamClass}
                        className="h-[40px] bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs"
                      />
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

                  <TouchableOpacity onPress={handleCreateExam} className="h-[40px] bg-[#0d3666] rounded-lg items-center justify-center mt-2">
                    <Text className="text-xs font-bold text-white">Publish Exam Slot</Text>
                  </TouchableOpacity>
                </Card>
              )}

              <Card className="bg-white border border-gray-100 overflow-hidden">
                <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Exam Description</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-center">Class</Text>
                  <Text className="w-[150px] text-xs font-bold text-gray-400 uppercase text-center">Schedule Date</Text>
                  <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-right">Status</Text>
                </View>

                {MOCK_EXAMS.map((exam) => (
                  <View key={exam.id} className="flex-row items-center px-5 py-4 border-b border-gray-50">
                    <Text className="flex-1 text-sm font-bold text-gray-800">{exam.name}</Text>
                    <Text className="w-[120px] text-sm text-gray-500 font-semibold text-center">{exam.class}</Text>
                    <Text className="w-[150px] text-sm text-gray-500 font-semibold text-center">{exam.date}</Text>
                    <View className="w-[100px] items-end">
                      <View className={`px-2.5 py-1 rounded-full ${exam.status === 'Published' ? 'bg-green-50' : 'bg-orange-50'}`}>
                        <Text className={`text-[10px] font-bold ${exam.status === 'Published' ? 'text-green-700' : 'text-orange-700'}`}>
                          {exam.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* TAB 2: Enter Marks */}
          {activeTab === "marks" && (
            <View className="gap-4">
              {/* Select Panel */}
              <Card className="bg-white border border-gray-100 p-5">
                <View className="flex-row gap-4 items-center">
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-gray-400 uppercase mb-2">Selected Exam</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {MOCK_EXAMS.map((ex) => (
                        <TouchableOpacity
                          key={ex.id}
                          onPress={() => setSelectedExam(ex.name)}
                          className={`px-4 py-2 rounded-lg border ${
                            selectedExam === ex.name ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                          }`}
                        >
                          <Text className={`text-xs font-bold ${selectedExam === ex.name ? "text-white" : "text-gray-700"}`}>
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-gray-400 uppercase mb-2">Subject</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {MOCK_SUBJECTS.map((sub) => (
                        <TouchableOpacity
                          key={sub}
                          onPress={() => setSelectedSubject(sub)}
                          className={`px-4 py-2 rounded-lg border ${
                            selectedSubject === sub ? "bg-[#f5921e] border-orange-500" : "bg-white border-gray-200"
                          }`}
                        >
                          <Text className={`text-xs font-bold ${selectedSubject === sub ? "text-white" : "text-gray-700"}`}>
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Card>

              {/* Roster Marks Table */}
              <View className="flex-row justify-between items-end px-1">
                <Text className="text-sm font-bold text-gray-800">
                  Roster Marks Grid: {selectedExam} ({selectedSubject})
                </Text>
                <TouchableOpacity 
                  onPress={handleSaveMarks}
                  className="px-4 py-1.5 bg-[#0d3666] rounded-lg"
                >
                  <Text className="text-xs font-bold text-white">Save Changes</Text>
                </TouchableOpacity>
              </View>

              <Card className="bg-white border border-gray-100 overflow-hidden">
                <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Text className="w-16 text-xs font-bold text-gray-400 uppercase">Roll</Text>
                  <Text className="w-24 text-xs font-bold text-gray-400 uppercase">GR Number</Text>
                  <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Student Name</Text>
                  <Text className="w-[150px] text-xs font-bold text-gray-400 uppercase text-right">Marks Obtained (Max: 100)</Text>
                </View>

                {studentMarks.map((student, idx) => (
                  <View 
                    key={student.id} 
                    className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <Text className="w-16 text-sm font-bold text-gray-400">{student.rollNo}</Text>
                    <Text className="w-24 text-sm font-bold text-gray-400">{student.grNo}</Text>
                    <Text className="flex-1 text-sm font-bold text-gray-800">{student.name}</Text>
                    
                    <View className="w-[150px] items-end">
                      <TextInput
                        value={((student.marks as any)[selectedSubject] ?? "").toString()}
                        onChangeText={(val) => handleMarkChange(student.id, selectedSubject, val)}
                        keyboardType="numeric"
                        className="w-20 h-[36px] bg-gray-50 border border-gray-250 rounded-lg text-center text-sm font-bold text-gray-800"
                      />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* TAB 3: Rank List */}
          {activeTab === "ranks" && (
            <View className="gap-4">
              <View className="px-1">
                <Text className="text-sm font-bold text-gray-800">Student Standings Ranks</Text>
                <Text className="text-xs text-gray-400 font-semibold mt-1">Based on first term examination overall results</Text>
              </View>

              <Card className="bg-white border border-gray-100 overflow-hidden">
                <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Text className="w-16 text-xs font-bold text-gray-400 uppercase">Rank</Text>
                  <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Student Name</Text>
                  <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-center">Class Avg</Text>
                  <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-center">Grade</Text>
                  <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-right">Total Marks</Text>
                </View>

                {calculatedRanks.map((rank, idx) => (
                  <View 
                    key={rank.id} 
                    className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <Text className="w-16 text-sm font-bold text-orange-500">#{idx + 1}</Text>
                    <Text className="flex-1 text-sm font-bold text-gray-800">{rank.name}</Text>
                    <Text className="w-[100px] text-sm text-gray-500 font-semibold text-center">{rank.avg}%</Text>
                    
                    <View className="w-[100px] items-center">
                      <View className="px-2.5 py-0.5 bg-indigo-50 rounded-full">
                        <Text className="text-[10px] font-bold text-indigo-700">{rank.grade}</Text>
                      </View>
                    </View>

                    <Text className="w-[100px] text-sm text-gray-900 font-bold text-right">{rank.total}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* TAB 4: Generate Marksheet */}
          {activeTab === "report" && (
            <Card className="bg-white border border-gray-100 p-6 max-w-[800px] self-center w-full shadow-md">
              {/* Report Header */}
              <View className="items-center border-b-2 border-gray-800 pb-4 mb-6">
                <Text className="text-lg font-bold text-[#0d3666] tracking-wider uppercase">LITTLE ANGEL'S ENGLISH SCHOOL</Text>
                <Text className="text-xs text-gray-500 font-bold mt-1">ACADEMIC EVALUATION MARKSHEET</Text>
                <Text className="text-[11px] text-gray-400 font-semibold mt-1">Primary Department • Academic Term I</Text>
              </View>

              {/* Student Meta Details */}
              <View className="flex-row justify-between mb-6 px-1">
                <View>
                  <Text className="text-xs text-gray-400 font-bold uppercase mb-0.5">Student Name</Text>
                  <Text className="text-sm font-bold text-gray-800">Pooja Patel</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400 font-bold uppercase mb-0.5">GR Number • Roll No</Text>
                  <Text className="text-sm font-bold text-gray-800">GR-1044 • Roll No 14</Text>
                </View>
              </View>

              {/* Subject scores */}
              <View className="border border-gray-800 rounded-lg overflow-hidden mb-6">
                <View className="flex-row bg-gray-50 border-b border-gray-800 py-2.5 px-4">
                  <Text className="flex-1 text-xs font-bold text-gray-800 uppercase">Subject Name</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-800 uppercase text-right">Max Marks</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-800 uppercase text-right">Obtained</Text>
                </View>

                {Object.entries(studentMarks[0].marks).map(([subject, mark], idx) => (
                  <View key={idx} className="flex-row border-b border-gray-100 py-3 px-4 bg-white">
                    <Text className="flex-1 text-sm font-semibold text-gray-700">{subject}</Text>
                    <Text className="w-[120px] text-sm text-gray-500 font-semibold text-right">100</Text>
                    <Text className="w-[120px] text-sm text-gray-900 font-bold text-right">{mark}</Text>
                  </View>
                ))}
              </View>

              {/* Aggregate Row Card */}
              <View className="flex-row justify-between items-center py-4 bg-gray-50 border border-gray-200 px-5 rounded-xl mb-6">
                <View>
                  <Text className="text-xs text-gray-400 font-bold uppercase">Aggregate Avg</Text>
                  <Text className="text-xl font-bold text-[#0d3666]">86.2%</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400 font-bold uppercase">Grade Class</Text>
                  <Text className="text-xl font-bold text-green-700">A Distinction</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => Alert.alert("Success", "Marksheet PDF downloaded successfully.")}
                className="h-[48px] bg-[#f5921e] rounded-xl items-center justify-center shadow-md shadow-orange-100"
              >
                <Text className="text-sm font-bold text-white">📥 Download Official Marksheet Report</Text>
              </TouchableOpacity>
            </Card>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
