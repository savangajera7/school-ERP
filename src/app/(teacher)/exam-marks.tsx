import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { Card } from "@/components/ui/Card";
import { useGetApiExamGetExamList } from "@/api/generated/exam/exam";
import { useGetApiSubjectGetSubjectList } from "@/api/generated/subject/subject";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import { useGetApiSectionGetSectionList } from "@/api/generated/master-section/master-section";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { usePostApiResultInsertResult, useGetApiResultGetResultList } from "@/api/generated/result/result";
import { parseApiList } from "@/utils/apiResponse";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { StudentModel } from "@/api/model/studentModel";
import { Colors } from "@/constants/colors";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { GenderIcon } from "@/components/icons/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { useResponsive } from "@/hooks/useResponsive";

export default function ExamMarksScreen() {
  const { isMobile } = useResponsive();
  const { alert } = useDialog();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  
  const { showToast } = useToast();
  const userData = useAuthStore((s) => s.userData);
  
  // API Hooks
  const { data: examsData, isLoading: loadingExams } = useGetApiExamGetExamList();
  const { data: subjectsData, isLoading: loadingSubjects } = useGetApiSubjectGetSubjectList();
  const { data: classesData, isLoading: loadingClasses } = useGetApiClassGetClassList();
  const { data: sectionsData, isLoading: loadingSections } = useGetApiSectionGetSectionList();
  const { data: studentsData, isLoading: loadingStudents } = useGetApiStudentGet();
  const { data: resultsData, isLoading: loadingResults, refetch: refetchResults } = useGetApiResultGetResultList();
  const insertResult = usePostApiResultInsertResult();

  const exams = useMemo(() => parseApiList(examsData?.data), [examsData]);
  const subjects = useMemo(() => parseApiList(subjectsData?.data), [subjectsData]);
  const classes = useMemo(() => parseApiList(classesData?.data), [classesData]);
  const sections = useMemo(() => parseApiList(sectionsData?.data), [sectionsData]);
  const allResults = useMemo(() => parseApiList(resultsData?.data), [resultsData]);
  
  const [marksMap, setMarksMap] = useState<Record<number, string>>({});

  const allStudents = useMemo(
    () => parseApiList<StudentModel>(studentsData?.data),
    [studentsData]
  );

  const filteredStudents = useMemo(() => {
    return allStudents.filter(
      (s) =>
        (!selectedClassId || s.classID === selectedClassId) &&
        (!selectedSectionId || s.sectionID === selectedSectionId)
    );
  }, [allStudents, selectedClassId, selectedSectionId]);

  const handleMarkChange = (studentId: number, value: string) => {
    setMarksMap(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!selectedExamId || !selectedSubjectId) {
      await alert("Selection Required", "Please select an exam and a subject first.", "warning");
      return;
    }

    try {
      const addedBy = parseInt(userData?.id ?? "0", 10) || 0;
      const promises = filteredStudents.map((student) => {
        if (!student.studentID) return Promise.resolve();
        const obtainMarks = parseFloat(marksMap[student.studentID] || "0");
        return insertResult.mutateAsync({
          data: {
            examID: selectedExamId,
            studentID: student.studentID,
            subjectID: selectedSubjectId,
            totalMarks: 100, // Default total marks
            obtainMarks,
            grade: obtainMarks >= 35 ? "Pass" : "Fail",
            resultStatus: obtainMarks >= 35 ? "Pass" : "Fail",
            addedBy,
          },
        });
      });

      await Promise.all(promises);
      showToast(`${filteredStudents.length} results saved successfully.`, "success");
      refetchResults();
    } catch (error) {
      console.error("Failed to save marks:", error);
      showToast("Failed to save marks.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Exam Marks Entry"
      subtitle="Enter and manage student marks for exams"
      onBack={() => router.push("/(teacher)/dashboard")}
      rightAction={
        <TouchableOpacity
          onPress={handleSave}
          disabled={insertResult.isPending}
          className={`px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 shadow-md ${
            insertResult.isPending ? "bg-white/10" : ""
          }`}
          style={!insertResult.isPending ? { backgroundColor: Colors.accent } : {}}
          activeOpacity={0.8}
        >
          {insertResult.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-black text-xs uppercase tracking-widest">Save All</Text>
          )}
        </TouchableOpacity>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <PremiumCard noAccent style={{ padding: 16, marginBottom: 14 }}>
          <View className="gap-4">
            <View>
              <Text className="text-[12px] font-black text-gray-405 mb-2 uppercase tracking-wider">Select Exam</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {exams.map((exam: any) => (
                  <TouchableOpacity
                    key={exam.examID}
                    onPress={() => setSelectedExamId(exam.examID)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedExamId === exam.examID ? "bg-primary border-primary" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedExamId === exam.examID ? "text-white" : "text-gray-600"}`}>
                      {exam.examName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View>
              <Text className="text-[12px] font-black text-gray-405 mb-2 uppercase tracking-wider">Select Subject</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {subjects.map((sub: any) => (
                  <TouchableOpacity
                    key={sub.subjectID}
                    onPress={() => setSelectedSubjectId(sub.subjectID)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedSubjectId === sub.subjectID ? "bg-primary border-primary" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedSubjectId === sub.subjectID ? "text-white" : "text-gray-600"}`}>
                      {sub.subjectName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[12px] font-black text-gray-405 mb-2 uppercase tracking-wider">Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {classes.map((cls: any) => (
                    <TouchableOpacity
                      key={cls.classID}
                      onPress={() => setSelectedClassId(cls.classID)}
                      className={`px-4 py-2 rounded-xl border ${
                        selectedClassId === cls.classID ? "bg-primary border-primary" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs font-bold ${selectedClassId === cls.classID ? "text-white" : "text-gray-600"}`}>
                        {cls.className}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View className="flex-1">
                <Text className="text-[12px] font-black text-gray-405 mb-2 uppercase tracking-wider">Section</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {sections.map((sec: any) => (
                    <TouchableOpacity
                      key={sec.sectionID}
                      onPress={() => setSelectedSectionId(sec.sectionID)}
                      className={`px-4 py-2 rounded-xl border ${
                        selectedSectionId === sec.sectionID ? "bg-primary border-primary" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      }`}
                    >
                      <Text className={`text-xs font-bold ${selectedSectionId === sec.sectionID ? "text-white" : "text-gray-600"}`}>
                        {sec.sectionName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </PremiumCard>

        {loadingStudents || loadingExams || loadingSubjects ? (
          <SkeletonLoader rows={5} />
        ) : filteredStudents.length === 0 ? (
          <EmptyState title="No students found" message="Select class and section to see students" />
        ) : (
          <View className="gap-3">
            {filteredStudents.map((student) => (
              <Card key={student.studentID} className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <GenderIcon gender={student.gender} size={20} />
                  <View>
                    <Text className="text-sm font-bold text-gray-800">
                      {student.studentDisplayName || `${student.firstName} ${student.lastName}`}
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-medium">Roll No: {student.rollNo || "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Marks"
                    value={marksMap[student.studentID!] || ""}
                    onChangeText={(val) => handleMarkChange(student.studentID!, val)}
                    className="w-20 h-10 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm font-bold text-gray-800 text-center"
                  />
                  <Text className="text-xs font-bold text-gray-400">/ 100</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </PremiumScreenLayout>
  );
}
