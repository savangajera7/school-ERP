import React, { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { useGetApiExamGetExamList } from "@/api/generated/exam/exam";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, type TableColumn } from "@/components/shared";

export default function ParentExamsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiExamGetExamList();

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

  const tableColumns: TableColumn<any>[] = [
    { key: "examCode", header: "Code", width: 90 },
    { key: "examName", header: "Exam Name", flex: 2 },
    { key: "className", header: "Class", flex: 1 },
    { 
      key: "examDate", 
      header: "Date", 
      width: 100, 
      render: (e) => <Text className="text-sm text-gray-600">{formatDisplayDate(e.examDate)}</Text>
    },
    { 
      key: "status", 
      header: "Status", 
      width: 100, 
      align: "center",
      render: (e) => (
        <View className="px-2 py-1 bg-blue-50 rounded-md border border-blue-100">
          <Text className="text-[10px] font-bold text-blue-700">{e.status || "Upcoming"}</Text>
        </View>
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
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Examinations"
      subtitle="View your child's upcoming exams"
      scrollable={false}
      flatHeader
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
        emptyMessage={searchQuery ? "Try a different search" : "No exams scheduled"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search exam name or code..."
      />
    </PremiumScreenLayout>
  );
}
