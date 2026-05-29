import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import {
  buildAttendanceViewParams,
  parseDetailView,
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
import { premiumCardShadow } from "@/constants/premiumStyles";

export default function AttendanceDetailScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; className?: string; date?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const date = String(params.date ?? "");
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams = useMemo(
    () =>
      classID
        ? buildAttendanceViewParams("detail", { classID, attendanceDate: date, schoolID })
        : undefined,
    [classID, date, schoolID]
  );

  const { data, isLoading } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  const detail = useMemo(() => parseDetailView(data?.data), [data]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return detail.students;
    return detail.students.filter((s) =>
      getAttendanceRowName(s).toLowerCase().includes(q) ||
      String(getAttendanceRowRoll(s)).includes(q)
    );
  }, [detail.students, searchQuery]);

  const counts = useMemo(() => {
    let present = 0, absent = 0, leave = 0;
    detail.students.forEach((s) => {
      const st = normalizeAttendanceStatusFromApi(s.attendanceStatus);
      if (st === "Absent") absent++;
      else if (st === "Leave") leave++;
      else present++;
    });
    return { present, absent, leave, total: detail.students.length };
  }, [detail.students]);

  if (!access.canMarkClass(classID) && !access.isSchoolAdmin) {
    return <AccessDenied message="No permission to view this class attendance." />;
  }

  return (
    <PremiumScreenLayout
      title={`${className} — Detail`}
      subtitle={formatDisplayDate(detail.attendanceDate || date)}
      onBack={() => router.back()}
      scrollable={false}
      fullWidth
      rightAction={
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/mark",
              params: { classId: String(classID), className, date, marked: "1" },
            })
          }
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.85}
        >
          <AppIcon name="edit" size={13} color="#fff" />
          <Text className="text-white text-[11px] font-black uppercase">Edit</Text>
        </TouchableOpacity>
      }
    >
      {/* Audit card */}
      <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 mx-1" style={premiumCardShadow}>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Marked by</Text>
            <Text className="text-sm font-extrabold text-gray-900">{detail.takenBy || "—"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Last updated</Text>
            <Text className="text-sm font-semibold text-gray-700">{detail.lastUpdatedBy || "—"}</Text>
          </View>
        </View>
      </View>

      {/* Summary chips */}
      {!isLoading && counts.total > 0 && (
        <View className="flex-row gap-2 mb-3 px-1">
          <View className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-gray-400">Total</Text>
            <Text className="text-xl font-black text-gray-900">{counts.total}</Text>
          </View>
          <View className="flex-1 bg-white border border-emerald-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-emerald-600">Present</Text>
            <Text className="text-xl font-black text-emerald-700">{counts.present}</Text>
          </View>
          <View className="flex-1 bg-white border border-rose-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-rose-600">Absent</Text>
            <Text className="text-xl font-black text-rose-700">{counts.absent}</Text>
          </View>
          <View className="flex-1 bg-white border border-amber-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-amber-600">Leave</Text>
            <Text className="text-xl font-black text-amber-700">{counts.leave}</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View className="px-1 mb-3">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <AppIcon name="search" size={16} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search student..."
            className="flex-1 ml-2 text-sm font-semibold text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => String(item.studentID)}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 4 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-400 font-semibold text-sm">No attendance data found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const label = normalizeAttendanceStatusFromApi(item.attendanceStatus);
            const isPresent = label === "Present";
            const isLeave = label === "Leave";
            return (
              <View
                className="bg-white rounded-2xl mb-3 border border-gray-100"
                style={premiumCardShadow}
              >
                <View className="p-4 flex-row items-center gap-3">
                  <View className="relative">
                    <View className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center">
                      <GenderIcon gender={item.gender} size={24} />
                    </View>
                    {item.rollNumber != null && (
                      <View className="absolute -top-1.5 -right-1.5 bg-amber-500 border border-white min-w-[20px] h-5 px-1 rounded-full items-center justify-center">
                        <Text className="text-[9px] font-black text-white">{item.rollNumber}</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-gray-900" numberOfLines={1}>
                      {getAttendanceRowName(item)}
                    </Text>
                    <Text className="text-xs text-gray-400 font-semibold mt-0.5">
                      Roll {getAttendanceRowRoll(item)}
                    </Text>
                    {item.remark ? (
                      <Text className="text-xs text-gray-500 mt-0.5 italic">"{item.remark}"</Text>
                    ) : null}
                  </View>

                  <View
                    className={`px-3 py-1.5 rounded-full border ${
                      isPresent
                        ? "bg-emerald-50 border-emerald-200"
                        : isLeave
                        ? "bg-amber-50 border-amber-200"
                        : "bg-rose-50 border-rose-200"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase ${
                        isPresent ? "text-emerald-700" : isLeave ? "text-amber-700" : "text-rose-700"
                      }`}
                    >
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
