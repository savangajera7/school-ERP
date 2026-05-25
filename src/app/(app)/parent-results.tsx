import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useResponsive } from "@/hooks/useResponsive";
import { useGetApiResultGetResultList } from "@/api/generated/result/result";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { parseApiList } from "@/utils/apiResponse";

interface SubjectMark {
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

interface StudentResult {
  examName: string;
  examDate: string;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail";
  subjects: SubjectMark[];
}

export default function ParentResultsScreen() {
  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);

  const { data, isLoading: loading } = useGetApiResultGetResultList();
  const studentId = Number(userData?.id) || 0;

  const results = useMemo(() => {
    const list = parseApiList<Record<string, unknown>>(data?.data).filter(
      (r) => !studentId || r.studentID === studentId
    );
    if (list.length === 0) return [];

    const byExam = new Map<string, StudentResult>();
    list.forEach((row) => {
      const examKey = String(row.examName ?? row.examID ?? "Exam");
      if (!byExam.has(examKey)) {
        byExam.set(examKey, {
          examName: examKey,
          examDate: String(row.examDate ?? "N/A"),
          totalMarks: 0,
          percentage: 0,
          grade: String(row.grade ?? "—"),
          status: (row.resultStatus as "Pass" | "Fail") ?? "Pass",
          subjects: [],
        });
      }
      const exam = byExam.get(examKey)!;
      exam.subjects.push({
        subjectName: String(row.subjectName ?? `Subject ${row.subjectID}`),
        marksObtained: Number(row.obtainMarks ?? 0),
        totalMarks: Number(row.totalMarks ?? 100),
        grade: String(row.grade ?? "—"),
      });
      exam.totalMarks += Number(row.obtainMarks ?? 0);
    });

    return Array.from(byExam.values()).map((e) => {
      const max = e.subjects.reduce((s, sub) => s + sub.totalMarks, 0) || 1;
      return { ...e, percentage: Math.round((e.totalMarks / max) * 1000) / 10 };
    });
  }, [data, studentId]);

  React.useEffect(() => {
    if (results.length > 0 && !selectedResult) {
      setSelectedResult(results[0]);
    }
  }, [results, selectedResult]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <PremiumLoader color={Colors.primary} size={40} />
      </View>
    );
  }

  return (
    <PremiumScreenLayout
      title="Academic Results"
      subtitle="Exam performance and marksheets"
      onBack={() => router.push("/(app)/dashboard")}
    >
          {results.length === 0 ? (
            <Card className="p-8 items-center">
              <Text className="text-gray-500 text-center">
                No published results yet. Check back after exams are graded.
              </Text>
            </Card>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {results.map((r) => (
                  <TouchableOpacity
                    key={r.examName}
                    onPress={() => setSelectedResult(r)}
                    className={`mr-3 px-4 py-3 rounded-2xl border ${
                      selectedResult?.examName === r.examName
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        selectedResult?.examName === r.examName ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {r.examName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedResult && (
                <Card className="p-6">
                  <Text className="text-xl font-black text-primary mb-2">
                    {selectedResult.examName}
                  </Text>
                  <Text className="text-gray-500 mb-4">{selectedResult.examDate}</Text>
                  <View className="flex-row gap-4 mb-6">
                    <View className="bg-blue-50 px-4 py-2 rounded-xl">
                      <Text className="text-xs text-gray-500">Percentage</Text>
                      <Text className="font-black text-primary">{selectedResult.percentage}%</Text>
                    </View>
                    <View className="bg-green-50 px-4 py-2 rounded-xl">
                      <Text className="text-xs text-gray-500">Grade</Text>
                      <Text className="font-black text-green-700">{selectedResult.grade}</Text>
                    </View>
                  </View>
                  {selectedResult.subjects.map((s, i) => (
                    <View
                      key={i}
                      className="flex-row justify-between py-3 border-b border-gray-100"
                    >
                      <Text className="font-semibold text-gray-800">{s.subjectName}</Text>
                      <Text className="text-gray-600">
                        {s.marksObtained}/{s.totalMarks} ({s.grade})
                      </Text>
                    </View>
                  ))}
                </Card>
              )}
            </>
          )}
    </PremiumScreenLayout>
  );
}
