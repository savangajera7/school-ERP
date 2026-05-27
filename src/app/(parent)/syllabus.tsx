import React, { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { useGetApiSyllabusGet } from "@/api/generated/11-syllabus/11-syllabus";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { ResponsiveDataList, type TableColumn } from "@/components/shared";

export default function ParentSyllabusScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiSyllabusGet();

  const subjects = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter((s) => {
      const name = (s.subjectName || "").toLowerCase();
      return name.includes(q) || (s.subjectCode || "").toLowerCase().includes(q);
    });
  }, [subjects, searchQuery]);

  const tableColumns: TableColumn<any>[] = [
    { key: "subjectCode", header: "Code", width: 90 },
    { key: "subjectName", header: "Subject Name", flex: 2 },
    { key: "subjectType", header: "Type", flex: 1 },
  ];

  const renderSubjectItem = (item: any) => {
    return (
      <MobileDataCard
        title={item.subjectName || "Unknown Subject"}
        subtitle={`Code: ${item.subjectCode || "N/A"}`}
        icon={<IconCircle name="reports" size={44} iconSize={22} />}
        fields={[
          { label: "Type", value: item.subjectType || "Theory" },
        ]}
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Syllabus"
      subtitle="View curriculum subjects"
      scrollable={false}
      flatHeader
    >
      <ResponsiveDataList
        data={filteredSubjects}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderSubjectItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.subjectID)}
        emptyIcon="reports"
        emptyTitle="No subjects found"
        emptyMessage={searchQuery ? "Try a different search" : "No syllabus available"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search subject name..."
      />
    </PremiumScreenLayout>
  );
}
