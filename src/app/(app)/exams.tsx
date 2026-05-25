import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumTabSwitcher } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetApiClassGetClassList } from "@/api/generated/master-class/master-class";
import {
  useGetApiExamGetExamList,
  usePostApiExamInsertExam,
} from "@/api/generated/exam/exam";
import { useGetApiSubjectGetSubjectList } from "@/api/generated/subject/subject";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import {
  useGetApiResultGetResultList,
  usePostApiResultInsertResult,
} from "@/api/generated/result/result";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

type Tab = "list" | "marks" | "ranks";

export default function ExamsManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const { showToast } = useToast();
  const userData = useAuthStore((s) => s.userData);
  const createdBy = parseInt(userData?.id ?? "0", 10) || 0;

  const { data: classesData, isLoading: loadingClasses } = useGetApiClassGetClassList();
  const { data: examsData, isLoading: loadingExams, refetch: refetchExams } =
    useGetApiExamGetExamList();
  const { data: subjectsData } = useGetApiSubjectGetSubjectList();
  const { data: studentsData } = useGetApiStudentGet();
  const { data: resultsData, refetch: refetchResults } = useGetApiResultGetResultList();

  const insertExamMutation = usePostApiExamInsertExam();
  const insertResultMutation = usePostApiResultInsertResult();

  const classes = parseApiList(classesData?.data);
  const exams = parseApiList<Record<string, unknown>>(examsData?.data);
  const subjects = parseApiList<Record<string, unknown>>(subjectsData?.data);
  const students = parseApiList<Record<string, unknown>>(studentsData?.data);
  const results = parseApiList<Record<string, unknown>>(resultsData?.data);

  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [examDate, setExamDate] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [marksByStudent, setMarksByStudent] = useState<Record<number, string>>({});

  useEffect(() => {
    if (exams.length && selectedExamId == null) {
      setSelectedExamId(Number(exams[0].examID) || null);
    }
  }, [exams, selectedExamId]);

  useEffect(() => {
    if (subjects.length && selectedSubjectId == null) {
      setSelectedSubjectId(Number(subjects[0].subjectID) || null);
    }
  }, [subjects, selectedSubjectId]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return students;
    return students.filter(
      (s) => Number(s.classID) === selectedClassId
    );
  }, [students, selectedClassId]);

  const ranks = useMemo(() => {
    const byStudent = new Map<number, { name: string; total: number; count: number }>();
    for (const r of results) {
      const sid = Number(r.studentID);
      if (!sid) continue;
      const marks = Number(r.obtainMarks ?? 0);
      const cur = byStudent.get(sid) ?? {
        name: recordLabel(r, "studentDisplayName", "studentName") || `Student ${sid}`,
        total: 0,
        count: 0,
      };
      cur.total += marks;
      cur.count += 1;
      byStudent.set(sid, cur);
    }
    return [...byStudent.entries()]
      .map(([id, v]) => ({
        id,
        name: v.name,
        avg: v.count ? (v.total / v.count).toFixed(1) : "0",
        total: v.total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [results]);

  const handleCreateExam = async () => {
    if (!examName.trim() || !examDate.trim()) {
      showToast("Exam name and date are required.", "error");
      return;
    }
    try {
      await insertExamMutation.mutateAsync({
        data: {
          examName: examName.trim(),
          examDate: examDate.trim(),
          classID: selectedClassId ?? undefined,
          createdBy,
        },
      });
      showToast("Exam created.", "success");
      setShowAddExam(false);
      setExamName("");
      setExamDate("");
      refetchExams();
    } catch {
      showToast("Failed to create exam.", "error");
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedSubjectId) {
      showToast("Select exam and subject first.", "error");
      return;
    }
    const entries = classStudents.filter((s) => {
      const id = Number(s.studentID);
      return id && marksByStudent[id] !== undefined && marksByStudent[id] !== "";
    });
    if (!entries.length) {
      showToast("Enter marks for at least one student.", "error");
      return;
    }
    try {
      await Promise.all(
        entries.map((s) =>
          insertResultMutation.mutateAsync({
            data: {
              studentID: Number(s.studentID),
              examID: selectedExamId,
              subjectID: selectedSubjectId,
              obtainMarks: parseInt(marksByStudent[Number(s.studentID)] ?? "0", 10) || 0,
              totalMarks: 100,
              addedBy: createdBy,
            },
          })
        )
      );
      showToast("Marks saved.", "success");
      refetchResults();
    } catch {
      showToast("Failed to save marks.", "error");
    }
  };

  const isLoading = loadingExams || loadingClasses;

  return (
    <PremiumScreenLayout
      title="Examinations"
      subtitle="Exams, marks & rankings"
      onBack={() => router.back()}
      headerSlot={
        <PremiumTabSwitcher
          tabs={[
            { key: "list", label: "Exams" },
            { key: "marks", label: "Marks" },
            { key: "ranks", label: "Ranks" },
          ]}
          active={activeTab}
          onChange={(k) => setActiveTab(k as Tab)}
        />
      }
    >
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <View>
          {activeTab === "list" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => setShowAddExam(!showAddExam)}
                className="self-end px-4 py-2 bg-[#f5921e] rounded-xl"
              >
                <Text className="text-white text-xs font-black">+ Create exam</Text>
              </TouchableOpacity>
              {showAddExam && (
                <Card className="p-4 gap-3">
                  <TextInput
                    placeholder="Exam name"
                    value={examName}
                    onChangeText={setExamName}
                    className="border border-gray-200 rounded-xl px-4 py-3"
                  />
                  <TextInput
                    placeholder="Date (YYYY-MM-DD)"
                    value={examDate}
                    onChangeText={setExamDate}
                    className="border border-gray-200 rounded-xl px-4 py-3"
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {classes.map((c: Record<string, unknown>) => (
                        <TouchableOpacity
                          key={String(c.classID)}
                          onPress={() => setSelectedClassId(Number(c.classID))}
                          className={`px-3 py-2 rounded-lg border ${
                            selectedClassId === Number(c.classID)
                              ? "bg-[#0d3666] border-[#0d3666]"
                              : "border-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              selectedClassId === Number(c.classID)
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          >
                            {recordLabel(c, "className")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <TouchableOpacity
                    onPress={handleCreateExam}
                    className="bg-[#0d3666] py-3 rounded-xl items-center"
                  >
                    {insertExamMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Save exam</Text>
                    )}
                  </TouchableOpacity>
                </Card>
              )}
              {exams.length === 0 ? (
                <EmptyState title="No exams" message="Create an exam to get started." />
              ) : (
                exams.map((exam, i) => (
                  <MobileDataCard
                    key={String(exam.examID ?? i)}
                    title={recordLabel(exam, "examName")}
                    subtitle={String(exam.examDate ?? "")}
                    fields={[
                      {
                        label: "Class ID",
                        value: String(exam.classID ?? "—"),
                      },
                    ]}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === "marks" && (
            <View className="gap-4">
              <Text className="text-xs font-bold text-gray-500 uppercase">Exam</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {exams.map((e) => (
                    <TouchableOpacity
                      key={String(e.examID)}
                      onPress={() => setSelectedExamId(Number(e.examID))}
                      className={`px-3 py-2 rounded-lg border ${
                        selectedExamId === Number(e.examID)
                          ? "bg-[#0d3666] border-[#0d3666]"
                          : "border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          selectedExamId === Number(e.examID) ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {recordLabel(e, "examName")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Text className="text-xs font-bold text-gray-500 uppercase">Subject</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {subjects.map((s) => (
                    <TouchableOpacity
                      key={String(s.subjectID)}
                      onPress={() => setSelectedSubjectId(Number(s.subjectID))}
                      className={`px-3 py-2 rounded-lg border ${
                        selectedSubjectId === Number(s.subjectID)
                          ? "bg-[#0d3666] border-[#0d3666]"
                          : "border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          selectedSubjectId === Number(s.subjectID)
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {recordLabel(s, "subjectName")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity
                onPress={handleSaveMarks}
                className="bg-[#0d3666] py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Save marks</Text>
              </TouchableOpacity>
              {classStudents.length === 0 ? (
                <EmptyState message="No students found for the selected class." />
              ) : (
                classStudents.map((s, i) => {
                  const sid = Number(s.studentID);
                  const name =
                    recordLabel(s, "studentDisplayName") ||
                    `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
                  return (
                    <View
                      key={String(sid || i)}
                      className="flex-row items-center justify-between bg-white border border-gray-100 rounded-xl p-4"
                    >
                      <Text className="font-bold text-gray-800 flex-1">{name}</Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0–100"
                        value={marksByStudent[sid] ?? ""}
                        onChangeText={(v) =>
                          setMarksByStudent((prev) => ({ ...prev, [sid]: v }))
                        }
                        className="w-16 border border-gray-200 rounded-lg text-center font-bold"
                      />
                    </View>
                  );
                })
              )}
            </View>
          )}

          {activeTab === "ranks" && (
            <View className="gap-3">
              {ranks.length === 0 ? (
                <EmptyState message="Save marks to see rankings." />
              ) : (
                ranks.map((r, idx) => (
                  <MobileDataCard
                    key={String(r.id)}
                    title={`#${idx + 1} ${r.name}`}
                    subtitle={`Total: ${r.total}`}
                    fields={[{ label: "Average", value: `${r.avg}%` }]}
                  />
                ))
              )}
            </View>
          )}
        </View>
      )}
    </PremiumScreenLayout>
  );
}
