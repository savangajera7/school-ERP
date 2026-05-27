import React, { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useGetApiResultGetResultList } from "@/api/generated/result/result";
import { useAuthStore } from "@/store/authStore";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { ResponsiveDataList, type TableColumn } from "@/components/shared";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
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
  status: string;
  subjects: SubjectMark[];
}

export default function ParentResultsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { userData } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useGetApiResultGetResultList();
  
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
          status: (row.resultStatus as string) ?? "Pass",
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

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return results;
    return results.filter(r => r.examName.toLowerCase().includes(q));
  }, [results, searchQuery]);

  const tableColumns: TableColumn<StudentResult>[] = [
    { key: "examName", header: "Exam Name", flex: 2 },
    { key: "examDate", header: "Date", flex: 1 },
    { key: "percentage", header: "Score", flex: 1, render: (r) => <Text className="font-bold text-gray-800">{r.percentage}%</Text> },
    { 
      key: "grade", 
      header: "Grade", 
      width: 100, 
      align: "center",
      render: (r) => (
        <View className="px-2 py-1 bg-green-50 rounded-md border border-green-100">
          <Text className="text-[10px] font-bold text-green-700">{r.grade}</Text>
        </View>
      )
    }
  ];

  const renderResultItem = (item: StudentResult) => (
    <MobileDataCard
      title={item.examName}
      subtitle={item.examDate}
      icon={<IconCircle name="reports" size={44} iconSize={22} />}
      fields={[
        { label: "Percentage", value: `${item.percentage}%` },
        { label: "Grade", value: item.grade, highlight: "success" },
      ]}
    />
  );

  return (
    <PremiumScreenLayout
      title="Academic Results"
      subtitle="View your child's exam performance"
      scrollable={false}
      flatHeader
    >
      <ResponsiveDataList
        data={filteredResults}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderResultItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => item.examName}
        emptyIcon="reports"
        emptyTitle="No results available"
        emptyMessage={searchQuery ? "Try a different search" : "No exam results have been published yet."}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search exam name..."
      />
    </PremiumScreenLayout>
  );
}
