import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttendanceSummaryChips } from "@/components/attendance/AttendanceSummaryChips";
import {
  useGetApiTeacherAttendanceGet,
  usePostApiTeacherAttendanceMark,
  getGetApiTeacherAttendanceGetQueryKey,
  buildTeacherAttendanceViewParams,
  parseTeacherRoster,
  buildTeacherAttendanceMarkRequest,
  normalizeTeacherStatusFromApi,
  assertAttendanceApiSuccess,
  getAttendanceApiMessage,
  isFutureDate,
  todayIsoDate,
  type TeacherRosterRow,
} from "@/api/attendance";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { Colors } from "@/constants/colors";
import { getApiErrorMessage } from "@/utils/recordHelpers";

type StaffStatus = "Present" | "Absent" | "Leave" | "Half Day";
const STATUS_OPTIONS: StaffStatus[] = ["Present", "Absent", "Leave", "Half Day"];

function statusShort(s: StaffStatus): string {
  return s === "Present" ? "P" : s === "Absent" ? "A" : s === "Leave" ? "L" : "½";
}

function TeacherMarkRow({
  teacher,
  status,
  remark,
  onStatusChange,
  onRemarkChange,
}: {
  teacher: TeacherRosterRow;
  status: StaffStatus;
  remark: string;
  onStatusChange: (s: StaffStatus) => void;
  onRemarkChange: (text: string) => void;
}) {
  const showRemark = status !== "Present";
  return (
    <View className="bg-white border border-gray-150 rounded-2xl p-4 mb-3 mx-1">
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center">
          <Text className="text-sm font-black text-indigo-600">
            {teacher.teacherName?.charAt(0)?.toUpperCase() ?? "T"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-black text-gray-900">{teacher.teacherName}</Text>
          <Text className="text-xs font-bold text-gray-400">
            {teacher.teacherCode || teacher.subjectName || `ID ${teacher.teacherID}`}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        {STATUS_OPTIONS.map((opt) => {
          const active = status === opt;
          const activeBg =
            opt === "Present"
              ? "bg-emerald-600 border-emerald-600"
              : opt === "Absent"
                ? "bg-rose-600 border-rose-600"
                : opt === "Leave"
                  ? "bg-amber-500 border-amber-500"
                  : "bg-sky-600 border-sky-600";
          return (
            <TouchableOpacity
              key={`${teacher.teacherID}-${opt}`}
              onPress={() => onStatusChange(opt)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${
                active ? activeBg : "bg-white border-gray-200"
              }`}
              activeOpacity={0.85}
            >
              <Text className={`text-xs font-black uppercase ${active ? "text-white" : "text-gray-400"}`}>
                {statusShort(opt)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showRemark && (
        <TextInput
          value={remark}
          onChangeText={onRemarkChange}
          placeholder="Remark (optional)"
          className="mt-2 h-10 border border-gray-200 rounded-xl px-3 text-sm bg-gray-50"
        />
      )}
    </View>
  );
}

export default function TeacherAttendanceScreen() {
  const { canManageStaffAttendance, isSchoolAdmin } = usePermissions();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const schoolID = useAuthStore((s) => s.userData?.schoolID);

  const [date, setDate] = useState(todayIsoDate());
  const [attendanceMap, setAttendanceMap] = useState<Record<number, StaffStatus>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const params = useMemo(
    () => buildTeacherAttendanceViewParams("teachers", { schoolID, attendanceDate: date }),
    [schoolID, date]
  );

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetApiTeacherAttendanceGet(params, {
      query: { enabled: canManageStaffAttendance && isSchoolAdmin },
    });

  const roster = useMemo(() => parseTeacherRoster(data?.data), [data]);

  useEffect(() => {
    const next: Record<number, StaffStatus> = {};
    const nextRemarks: Record<number, string> = {};
    roster.forEach((t) => {
      const label = normalizeTeacherStatusFromApi(t.attendanceStatus) as StaffStatus;
      next[t.teacherID] = STATUS_OPTIONS.includes(label) ? label : "Present";
      if (t.remark) nextRemarks[t.teacherID] = t.remark;
    });
    setAttendanceMap(next);
    setRemarks(nextRemarks);
  }, [roster]);

  const markMutation = usePostApiTeacherAttendanceMark();

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let halfDay = 0;
    roster.forEach((t) => {
      const st = attendanceMap[t.teacherID] ?? "Present";
      if (st === "Absent") absent++;
      else if (st === "Leave") leave++;
      else if (st === "Half Day") halfDay++;
      else present++;
    });
    return { present, absent, leave, halfDay };
  }, [roster, attendanceMap]);

  if (!canManageStaffAttendance || !isSchoolAdmin) {
    return (
      <AccessDenied message="Staff attendance is managed by the school admin only. Teachers can apply for leave from the Leave screen." />
    );
  }

  const markAllPresent = () => {
    const next: Record<number, StaffStatus> = {};
    roster.forEach((t) => {
      next[t.teacherID] = "Present";
    });
    setAttendanceMap(next);
    setRemarks({});
  };

  const handleSave = async () => {
    if (isFutureDate(date)) {
      showToast("Cannot mark attendance for a future date.", "error");
      return;
    }
    const teacherIds = roster.map((t) => t.teacherID).filter(Boolean);
    const payload = buildTeacherAttendanceMarkRequest({
      attendanceDate: date,
      schoolID: schoolID ?? null,
      teacherIds,
      attendanceMap: attendanceMap as Record<number, string>,
      remarks,
    });
    try {
      const res = await markMutation.mutateAsync({ data: payload });
      assertAttendanceApiSuccess(res);
      await queryClient.invalidateQueries({
        queryKey: getGetApiTeacherAttendanceGetQueryKey(),
      });
      showToast(getAttendanceApiMessage(res) ?? "Staff attendance saved.", "success");
    } catch (e) {
      showToast(getApiErrorMessage(e, "Failed to save staff attendance."), "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Staff attendance"
      subtitle="Teachers — default present, mark exceptions"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0 }}
      rightAction={
        <TouchableOpacity
          onPress={handleSave}
          disabled={markMutation.isPending || isLoading}
          className="px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.85}
        >
          {markMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-black text-xs uppercase">Save</Text>
          )}
        </TouchableOpacity>
      }
    >
      <View className="px-1 mb-3">
        <PremiumDatePicker
          label="Attendance date"
          value={date}
          onChange={(d) => {
            if (!isFutureDate(d)) setDate(d);
          }}
        />
        {isFutureDate(date) && (
          <Text className="text-rose-600 text-xs font-bold mt-1">
            Future dates cannot be marked.
          </Text>
        )}
      </View>

      <View className="px-1">
        <AttendanceSummaryChips
          present={counts.present}
          absent={counts.absent}
          leave={counts.leave}
        />
      </View>

      <View className="flex-row items-center justify-between px-1 mb-2">
        <Text className="text-xs font-bold text-gray-400">
          {counts.halfDay > 0 ? `Half day: ${counts.halfDay}` : " "}
        </Text>
        <TouchableOpacity onPress={markAllPresent}>
          <Text className="text-emerald-700 font-black text-xs uppercase">
            ✓ Mark all present
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : isError ? (
        <EmptyState
          icon="warning"
          title="Could not load staff"
          message={getApiErrorMessage(error, "Check API connection and login.")}
        />
      ) : (
        <FlatList
          data={roster}
          keyExtractor={(item) => String(item.teacherID)}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              icon="teachers"
              title="No teaching staff"
              message="No teachers found for this school."
            />
          }
          renderItem={({ item }) => (
            <TeacherMarkRow
              teacher={item}
              status={attendanceMap[item.teacherID] ?? "Present"}
              remark={remarks[item.teacherID] ?? ""}
              onStatusChange={(st) =>
                setAttendanceMap((prev) => ({ ...prev, [item.teacherID]: st }))
              }
              onRemarkChange={(text) =>
                setRemarks((prev) => ({ ...prev, [item.teacherID]: text }))
              }
            />
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
