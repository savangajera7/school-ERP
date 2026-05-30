import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttendanceSummaryChips } from "@/components/attendance/AttendanceSummaryChips";
import {
  useGetApiTeacherAttendanceGet,
  usePostApiTeacherAttendanceMark,
  usePutApiTeacherAttendanceUpdate,
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

const STATUS_CONFIG = {
  Present: {
    label: "P",
    active: "bg-emerald-600 border-emerald-600",
    inactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600",
    activeText: "text-white",
    inactiveText: "text-gray-400 dark:text-slate-300",
  },
  Absent: {
    label: "A",
    active: "bg-rose-600 border-rose-600",
    inactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600",
    activeText: "text-white",
    inactiveText: "text-gray-400 dark:text-slate-300",
  },
  Leave: {
    label: "L",
    active: "bg-amber-500 border-amber-500",
    inactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600",
    activeText: "text-white",
    inactiveText: "text-gray-400 dark:text-slate-300",
  },
} as const;

function TeacherMarkRow({
  teacher,
  status,
  remark,
  onStatusChange,
  onRemarkChange,
  isDark,
}: {
  teacher: TeacherRosterRow;
  status: StaffStatus;
  remark: string;
  onStatusChange: (s: StaffStatus) => void;
  onRemarkChange: (text: string) => void;
  isDark: boolean;
}) {
  const showRemark = status !== "Present";
  return (
    <View className="mx-3 mb-2">
      <View 
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-2.5 flex-row items-center"
        style={[premiumCardShadow, isDark && { shadowColor: "#000", shadowOpacity: 0.2 } ]}
      >
        <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 items-center justify-center mr-2.5">
          <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            {teacher.teacherName?.charAt(0)?.toUpperCase() ?? "T"}
          </Text>
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-[13px] font-bold text-gray-900 dark:text-slate-100" numberOfLines={1}>{teacher.teacherName}</Text>
          <Text className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
            {teacher.teacherCode || teacher.subjectName || `ID ${teacher.teacherID}`}
          </Text>
        </View>

        <View className="flex-row gap-1.5">
          {(["Present", "Absent", "Leave"] as const).map((opt) => {
            const c = STATUS_CONFIG[opt];
            const active = status === opt;
            return (
              <TouchableOpacity
                key={`${teacher.teacherID}-${opt}`}
                onPress={() => onStatusChange(opt)}
                className={`w-9 h-9 rounded-lg border items-center justify-center ${active ? c.active : c.inactive}`}
                activeOpacity={0.8}
              >
                <Text className={`text-[12px] font-black ${active ? c.activeText : c.inactiveText}`}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {showRemark && (
        <View className="mx-1 mt-1 mb-1">
          <TextInput
            value={remark}
            onChangeText={onRemarkChange}
            placeholder="Remark (optional)"
            className="h-10 border border-gray-200 dark:border-slate-600 rounded-xl px-3 text-xs bg-gray-50 dark:bg-slate-800 font-semibold text-gray-800 dark:text-slate-200" 
            placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
            style={{ paddingVertical: 8 }}
          />
        </View>
      )}
    </View>
  );
}

export default function TeacherAttendanceScreen() {
  const { canManageStaffAttendance, isSchoolAdmin } = usePermissions();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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
  const updateMutation = usePutApiTeacherAttendanceUpdate();
  const isSaving = markMutation.isPending || updateMutation.isPending || isLoading;

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
    const alreadyMarked = roster.some((t) => t.isMarked);

    const payload = buildTeacherAttendanceMarkRequest({
      attendanceDate: date,
      schoolID: schoolID ?? null,
      teacherIds,
      attendanceMap: attendanceMap as Record<number, string>,
      remarks,
    });
    
    try {
      // Use markMutation for both since it's the default-present bulk upsert endpoint
      const res = await markMutation.mutateAsync({ data: payload });
        
      assertAttendanceApiSuccess(res);
      await queryClient.invalidateQueries({
        queryKey: getGetApiTeacherAttendanceGetQueryKey(),
      });
      const msg = getAttendanceApiMessage(res) ?? (alreadyMarked ? "Staff attendance updated." : "Staff attendance saved.");
      showToast(msg, "success");
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
          disabled={isSaving}
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-black text-xs uppercase">{roster.some(t => t.isMarked) ? "Update" : "Save"}</Text>
          )}
        </TouchableOpacity>
      }
    >
      {/* Weekly Date Strip */}
      <View className="mb-4">
        <Text className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 mb-2 uppercase ml-1">Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 3 + i);
            const iso = d.toISOString().split("T")[0];
            const isSelected = date === iso;
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            const isFuture = isFutureDate(iso);
            return (
              <TouchableOpacity
                key={iso}
                onPress={() => { if (!isFuture) setDate(iso) }}
                className={`px-4 py-2 rounded-xl items-center justify-center border ${isSelected ? "bg-[#1A3C6E] border-[#1A3C6E]" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"} ${isFuture ? "opacity-50" : ""}`}
                activeOpacity={0.8}
                disabled={isFuture}
              >
                <Text className={`text-[9px] font-bold uppercase mb-0.5 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-slate-500'}`}>{dayName}</Text>
                <Text className={`text-[14px] font-black ${isSelected ? 'text-white' : 'text-gray-800 dark:text-slate-200'}`}>{dayNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {isFutureDate(date) && (
          <Text className="text-rose-600 text-xs font-bold mt-2 ml-1">
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

      <View className="flex-row items-center justify-between px-1 mb-3">
        <Text className="text-xs font-bold text-gray-400 dark:text-slate-500">
          {counts.halfDay > 0 ? `Half day: ${counts.halfDay}` : " "}
        </Text>
        <TouchableOpacity 
          onPress={markAllPresent} 
          className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800" 
          activeOpacity={0.7}
        >
          <Text className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
            ✓ All Present
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
              isDark={isDark}
            />
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
