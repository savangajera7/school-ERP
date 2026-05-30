import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import {
  buildAttendanceViewParams,
  parseHistoryView,
  normalizeAttendanceStatusFromApi,
  getAttendanceRowName,
  getAttendanceRowRoll,
} from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";

export default function AttendanceHistoryScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; date?: string; studentId?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const date = String(params.date ?? "");
  const studentID = params.studentId ? parseInt(String(params.studentId), 10) : undefined;
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "leave">("all");

  const queryParams = useMemo(
    () =>
      classID
        ? buildAttendanceViewParams("history", {
            classID,
            attendanceDate: date,
            studentID,
            schoolID,
          })
        : undefined,
    [classID, date, studentID, schoolID]
  );

  const { data, isLoading } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  const rows = useMemo(() => parseHistoryView(data?.data), [data]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => {
      const st = normalizeAttendanceStatusFromApi(r.attendanceStatus);
      if (filter === "present") return st === "Present";
      if (filter === "absent") return st === "Absent";
      return st === "Leave";
    });
  }, [rows, filter]);

  if (!access.isSchoolAdmin && !access.canMarkClass(classID)) {
    return <AccessDenied message="No permission to view attendance history." />;
  }

  const filterChips: { key: typeof filter; label: string; bgActive: string; bgInactive: string }[] = [
    { key: "all", label: "All", bgActive: "bg-[#1A3C6E]", bgInactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600" },
    { key: "present", label: "Present", bgActive: "bg-emerald-600", bgInactive: "bg-white dark:bg-slate-800 border-emerald-200" },
    { key: "absent", label: "Absent", bgActive: "bg-rose-600", bgInactive: "bg-white dark:bg-slate-800 border-rose-200" },
    { key: "leave", label: "Leave", bgActive: "bg-amber-500", bgInactive: "bg-white dark:bg-slate-800 border-amber-200" },
  ];

  return (
    <PremiumScreenLayout
      title="Attendance History"
      subtitle={formatDisplayDate(date)}
      scrollable={false}
      fullWidth
    >
      {/* Filter chips */}
      <View className="flex-row gap-2 mx-3 mt-3 mb-3">
        {filterChips.map((chip) => {
          const active = filter === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setFilter(chip.key)}
              className={`px-3.5 py-2 rounded-xl border ${active ? chip.bgActive : chip.bgInactive}`}
              activeOpacity={0.8}
            >
              <Text className={`text-[11px] font-black uppercase ${active ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredRows}
          keyExtractor={(item, i) => String(item.studentAttendanceID ?? item.studentID ?? i)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <AppIcon name="reports" size={32} color="#D1D5DB" />
              <Text className="text-gray-400 dark:text-slate-500 font-semibold text-sm mt-3">No history records found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const label = normalizeAttendanceStatusFromApi(item.attendanceStatus);
            const isPresent = label === "Present";
            const isLeave = label === "Leave";
            const badgeBg = isPresent ? "bg-emerald-50 border-emerald-200" : isLeave ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200";
            const badgeText = isPresent ? "text-emerald-700" : isLeave ? "text-amber-700" : "text-rose-700";

            return (
              <View className="mx-3 mb-2">
                <View
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-2.5 flex-row items-center"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
                >
                  {/* Photo */}
                  <View className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 items-center justify-center overflow-hidden mr-2.5">
                    {item.studentPhoto ? (
                      <Image source={{ uri: item.studentPhoto }} style={{ width: 40, height: 40 }} resizeMode="cover" />
                    ) : (
                      <GenderIcon gender={item.gender} size={20} />
                    )}
                  </View>

                  {/* Name + Details */}
                  <View className="flex-1 mr-2">
                    <Text className="text-[13px] font-bold text-gray-900 dark:text-slate-100" numberOfLines={1}>
                      {getAttendanceRowName(item)}
                    </Text>
                    <Text className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
                      Roll {getAttendanceRowRoll(item)}
                      {item.markedBy ? ` · By ${item.markedBy}` : ""}
                      {item.attendanceDate ? ` · ${formatDisplayDate(item.attendanceDate)}` : ""}
                    </Text>
                  </View>

                  {/* Status badge */}
                  <View className={`px-2.5 py-1.5 rounded-lg border ${badgeBg}`}>
                    <Text className={`text-[10px] font-black uppercase ${badgeText}`}>
                      {label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </PremiumScreenLayout>
  );
}
