import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet, usePostApiAttendanceMark, usePutApiAttendanceUpdate } from "@/api/attendance";
import {
  buildClassStudentsLoadParams,
  buildClassAbsentOnlyMarkRequest,
  parseStudentsView,
  normalizeAttendanceStatusFromApi,
  isPresentStatus,
  getGetApiAttendanceGetQueryKey,
  isFutureDate,
} from "@/api/attendance";
import type { MarkStatus } from "@/components/attendance/StudentMarkRow";
import { StudentMarkRow } from "@/components/attendance/StudentMarkRow";
import { AttendanceSummaryChips } from "@/components/attendance/AttendanceSummaryChips";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { Colors } from "@/constants/colors";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { getApiErrorMessage } from "@/utils/recordHelpers";

export default function MarkAttendanceScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{
    classId?: string;
    className?: string;
    date?: string;
    marked?: string;
  }>();

  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const date = String(params.date ?? new Date().toISOString().split("T")[0]);
  const alreadyMarked = params.marked === "1";

  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const userData = useAuthStore((s) => s.userData);

  const [attendanceMap, setAttendanceMap] = useState<Record<number, MarkStatus>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const queryParams = useMemo(
    () => (classID ? buildClassStudentsLoadParams(classID, date, userData?.schoolID) : undefined),
    [classID, date, userData?.schoolID]
  );

  const { data, isLoading, refetch } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  const markMutation = usePostApiAttendanceMark();
  const updateMutation = usePutApiAttendanceUpdate();
  const isSaving = markMutation.isPending || updateMutation.isPending;

  const { students } = useMemo(() => parseStudentsView(data?.data), [data]);

  useEffect(() => {
    const next: Record<number, MarkStatus> = {};
    const nextRemarks: Record<number, string> = {};
    students.forEach((s) => {
      if (!s.studentID) return;
      const norm = normalizeAttendanceStatusFromApi(s.attendanceStatus);
      next[s.studentID] =
        norm === "Absent" ? "Absent" : norm === "Leave" ? "Leave" : "Present";
      if (s.remark) nextRemarks[s.studentID] = s.remark;
    });
    setAttendanceMap(next);
    setRemarks(nextRemarks);
  }, [students]);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    students.forEach((s) => {
      const st = attendanceMap[s.studentID!] ?? "Present";
      if (st === "Absent") absent++;
      else if (st === "Leave") leave++;
      else present++;
    });
    return { present, absent, leave };
  }, [students, attendanceMap]);

  if (access.isAttendanceReadOnly) {
    return <Redirect href="/(parent)/attendance" />;
  }
  if (!classID || Number.isNaN(classID)) {
    return <Redirect href="/(app)/attendance" />;
  }
  if (!access.canMarkClass(classID)) {
    return (
      <AccessDenied message="You do not have attendance permission for this class. Contact school admin." />
    );
  }

  const markAllPresent = () => {
    const next: Record<number, MarkStatus> = {};
    students.forEach((s) => {
      if (s.studentID) next[s.studentID] = "Present";
    });
    setAttendanceMap(next);
    setRemarks({});
  };

  const handleSave = () => {
    if (isFutureDate(date)) {
      Alert.alert("Invalid date", "Cannot mark attendance for a future date.");
      return;
    }

    const studentIds = students.map((s) => s.studentID!).filter(Boolean);
    const absentRate = studentIds.length
      ? (counts.absent + counts.leave) / studentIds.length
      : 0;

    const doSave = async () => {
      const payload = buildClassAbsentOnlyMarkRequest({
        classID,
        attendanceDate: date,
        schoolID: userData?.schoolID ?? null,
        attendanceMap: attendanceMap as Record<number, string>,
        studentIds,
        remarks,
      });

      try {
        const res = alreadyMarked
          ? await updateMutation.mutateAsync({ data: payload })
          : await markMutation.mutateAsync({ data: payload });

        await queryClient.invalidateQueries({ queryKey: getGetApiAttendanceGetQueryKey() });

        const body = (res as { data?: { message?: string; sessionID?: string } })?.data;
        const msg =
          typeof body === "object" && body && "message" in body && body.message
            ? String(body.message)
            : alreadyMarked
              ? "Attendance updated."
              : "Attendance saved.";

        showToast(msg, "success");
        router.replace("/(app)/attendance");
      } catch (e) {
        showToast(getApiErrorMessage(e, "Failed to save attendance."), "error");
      }
    };

    if (absentRate > 0.5) {
      Alert.alert(
        "High absence rate",
        `More than half the class (${counts.absent + counts.leave} of ${studentIds.length}) is absent or on leave. Save anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: () => void doSave() },
        ]
      );
      return;
    }
    void doSave();
  };

  return (
    <PremiumScreenLayout
      title={className}
      subtitle={`${date} · ${alreadyMarked ? "Update" : "Mark"} attendance`}
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0 }}
      rightAction={
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || isLoading}
          className="px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-black text-xs uppercase">
              {alreadyMarked ? "Update" : "Save"}
            </Text>
          )}
        </TouchableOpacity>
      }
    >
      <View className="px-1 mb-2 flex-row justify-between items-center">
        <AttendanceSummaryChips
          present={counts.present}
          absent={counts.absent}
          leave={counts.leave}
        />
      </View>

      <TouchableOpacity onPress={markAllPresent} className="mb-3 px-1">
        <Text className="text-emerald-700 font-black text-xs uppercase">
          ✓ Mark all present (clear exceptions)
        </Text>
      </TouchableOpacity>

      <View className="flex-row gap-2 mb-3 px-1">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/detail",
              params: { classId: String(classID), className, date },
            })
          }
          className="flex-1 py-2 rounded-xl bg-white border border-gray-200 items-center"
        >
          <Text className="text-xs font-bold text-gray-600">View detail</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/history",
              params: { classId: String(classID), date },
            })
          }
          className="flex-1 py-2 rounded-xl bg-white border border-gray-200 items-center"
        >
          <Text className="text-xs font-bold text-gray-600">History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/monthly",
              params: { classId: String(classID), className },
            })
          }
          className="flex-1 py-2 rounded-xl bg-white border border-gray-200 items-center"
        >
          <Text className="text-xs font-bold text-gray-600">Monthly</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <SkeletonLoader variant="card" rows={6} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.studentID)}
          contentContainerStyle={{ paddingBottom: 100 }}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => {
            const sid = item.studentID!;
            return (
              <StudentMarkRow
                student={item}
                status={attendanceMap[sid] ?? "Present"}
                remark={remarks[sid] ?? ""}
                onStatusChange={(st) =>
                  setAttendanceMap((prev) => ({ ...prev, [sid]: st }))
                }
                onRemarkChange={(text) =>
                  setRemarks((prev) => ({ ...prev, [sid]: text }))
                }
              />
            );
          }}
        />
      )}
    </PremiumScreenLayout>
  );
}
