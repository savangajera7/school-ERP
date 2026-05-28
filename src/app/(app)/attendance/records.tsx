import React, { useState, useMemo, useCallback } from "react";
import { View, Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  useGetApiAttendanceGet,
  buildAttendanceListParams,
  parseAttendanceList,
  getAttendanceRowName,
  getAttendanceRecordId,
  normalizeAttendanceStatusFromApi,
  type AttendanceRow,
} from "@/api/attendance";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, type TableColumn } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";

function formatClassLabel(row: AttendanceRow): string {
  const name = row.className?.trim();
  const section = row.sectionName?.trim();
  if (name && section) return `${name} — ${section}`;
  if (name) return name;
  if (row.classID) return `Class ${row.classID}`;
  return "—";
}

export default function AttendanceRecordsScreen() {
  const { canManageAttendanceList, isSchoolAdmin } = useAttendanceAccess();
  const [searchQuery, setSearchQuery] = useState("");
  const schoolID = useAuthStore((s) => s.userData?.schoolID);

  const listParams = useMemo(
    () => buildAttendanceListParams({ schoolID }),
    [schoolID]
  );

  const { data, isLoading, isError, error, refetch } = useGetApiAttendanceGet(listParams);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const attendance = useMemo(() => parseAttendanceList(data?.data), [data]);

  const filteredAttendance = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return attendance;
    return attendance.filter((a) => {
      const name = getAttendanceRowName(a).toLowerCase();
      return (
        name.includes(q) ||
        formatClassLabel(a).toLowerCase().includes(q) ||
        (a.attendanceStatus || "").toLowerCase().includes(q)
      );
    });
  }, [attendance, searchQuery]);

  if (!canManageAttendanceList || !isSchoolAdmin) {
    return <AccessDenied message="Attendance records are for school admin only." />;
  }

  const openInClassMark = (row: AttendanceRow) => {
    if (!row.classID) return;
    const date = row.attendanceDate
      ? String(row.attendanceDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    router.push({
      pathname: "/(app)/attendance/mark",
      params: {
        classId: String(row.classID),
        className: row.className || `Class ${row.classID}`,
        date,
        marked: "1",
      },
    });
  };

  const tableColumns: TableColumn<AttendanceRow>[] = [
    {
      key: "studentName",
      header: "Student Name",
      flex: 2,
      render: (a) => (
        <Text className="text-sm font-semibold text-gray-800">{getAttendanceRowName(a)}</Text>
      ),
    },
    {
      key: "className",
      header: "Class",
      flex: 1,
      render: (a) => (
        <Text className="text-sm font-semibold text-gray-700">{formatClassLabel(a)}</Text>
      ),
    },
    {
      key: "attendanceDate",
      header: "Date",
      width: 120,
      render: (a) => (
        <Text className="text-sm font-semibold text-gray-700">
          {formatDisplayDate(a.attendanceDate)}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 100,
      align: "center",
      render: (a) => {
        const label = normalizeAttendanceStatusFromApi(a.attendanceStatus);
        const isPresent = label === "Present";
        return (
          <View
            className={`px-2 py-1 rounded-md border ${isPresent ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
          >
            <Text
              className={`text-[10px] font-bold ${isPresent ? "text-green-700" : "text-red-700"}`}
            >
              {label}
            </Text>
          </View>
        );
      },
    },
  ];

  const renderCard = (item: AttendanceRow) => {
    const label = normalizeAttendanceStatusFromApi(item.attendanceStatus);
    const isPresent = label === "Present";
    return (
      <MobileDataCard
        title={getAttendanceRowName(item)}
        subtitle={`${formatClassLabel(item)} · ${formatDisplayDate(item.attendanceDate)}`}
        accentColor={isPresent ? "#10B981" : "#EF4444"}
        icon={<IconCircle name="attendance" size={44} iconSize={22} />}
        onPress={() => openInClassMark(item)}
        badge={
          <View
            className={`${isPresent ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"} border px-2 py-1 rounded-lg`}
          >
            <Text
              className={`${isPresent ? "text-emerald-700" : "text-red-700"} font-black text-[10px] uppercase`}
            >
              {label}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Attendance records"
      subtitle="Exception rows saved in the database"
      onBack={() => router.back()}
      scrollable={false}
      flatHeader
    >
      <ResponsiveDataList
        data={filteredAttendance}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderCard}
        tableColumns={tableColumns}
        onRowPress={openInClassMark}
        keyExtractor={(item, index) => getAttendanceRecordId(item, index)}
        emptyIcon="attendance"
        emptyTitle="No records found"
        emptyMessage="Mark a class from Attendance home — only absent/leave rows appear here."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search student or class..."
      />
    </PremiumScreenLayout>
  );
}
