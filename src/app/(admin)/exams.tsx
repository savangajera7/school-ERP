import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useGetApiExamGetExamList, useDeleteApiExamDeleteExam } from "@/api/generated/exam/exam";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

export default function AdminExamsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, alert } = useDialog();

  const { data, isLoading, isError, error, refetch } = useGetApiExamGetExamList();
  const deleteExam = useDeleteApiExamDeleteExam();

  const exams = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredExams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return exams;
    return exams.filter((e) => {
      const name = (e.examName || "").toLowerCase();
      return (
        name.includes(q) ||
        (e.examCode || "").toLowerCase().includes(q) ||
        (e.className || "").toLowerCase().includes(q)
      );
    });
  }, [exams, searchQuery]);

  const handleDelete = async (exam: any) => {
    const ok = await confirm(
      "Delete Exam",
      `Are you sure you want to remove "${exam.examName}"?`,
      { confirmLabel: "Delete", destructive: true }
    );
    if (!ok) return;
    try {
      await deleteExam.mutateAsync({ data: { examID: exam.examID } });
      refetch();
    } catch (err: any) {
      await alert("Error", err.message || "Failed to delete exam", "error");
    }
  };

  const tableColumns: TableColumn<any>[] = [
    { key: "examCode", header: "Code", width: 90 },
    { key: "examName", header: "Exam Name", flex: 2 },
    { key: "className", header: "Class", flex: 1 },
    { 
      key: "examDate", 
      header: "Date", 
      width: 100, 
      render: (e) => <Text className="text-sm text-gray-600 dark:text-slate-400">{formatDisplayDate(e.examDate)}</Text>
    },
    { 
      key: "status", 
      header: "Status", 
      width: 100, 
      align: "center",
      render: (e) => (
        <View className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-100 dark:border-blue-800">
          <Text className="text-[10px] font-bold text-blue-700 dark:text-blue-400">{e.status || "Upcoming"}</Text>
        </View>
      )
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: 100, 
      align: "right", 
      render: (e) => (
        <EntityActionButtons 
          onEdit={() => router.push(`/(admin)/exam-form?id=${e.examID}`)}
          onDelete={() => handleDelete(e)}
        />
      )
    }
  ];

  const renderExamItem = (item: any) => {
    return (
      <MobileDataCard
        title={item.examName || "Untitled Exam"}
        subtitle={item.examCode || "No Code"}
        accentColor={Colors.primary}
        icon={<IconCircle name="exams" size={44} iconSize={22} />}
        fields={[
          { label: "Class", value: item.className || "All Classes" },
          { label: "Date", value: formatDisplayDate(item.examDate) },
          { label: "Status", value: item.status || "Upcoming", highlight: "accent" },
        ]}
        actions={
          <EntityActionButtons 
            onEdit={() => router.push(`/(admin)/exam-form?id=${item.examID}`)}
            onDelete={() => handleDelete(item)}
          />
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Examinations"
      subtitle="Schedule & results management"
      scrollable={false}
      flatHeader
      rightAction={
        <HeaderActionButton
          label="+ Create Exam"
          shortLabel="+ Add"
          onPress={() => router.push("/(admin)/exam-form")}
        />
      }
    >
      <ResponsiveDataList
        data={filteredExams}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderExamItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.examID)}
        emptyIcon="exams"
        emptyTitle="No exams found"
        emptyMessage={searchQuery ? "Try a different search" : "No exams scheduled yet"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search exam name or code..."
      />
    </PremiumScreenLayout>
  );
}
