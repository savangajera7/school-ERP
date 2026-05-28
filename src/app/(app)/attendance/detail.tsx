import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import { buildAttendanceViewParams, parseDetailView, normalizeAttendanceStatusFromApi } from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { getAttendanceRowName, getAttendanceRowRoll } from "@/api/attendance";
import { formatDisplayDate } from "@/utils/dateHelpers";

export default function AttendanceDetailScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; className?: string; date?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const date = String(params.date ?? "");
  const schoolID = useAuthStore((s) => s.userData?.schoolID);

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

  if (!access.canMarkClass(classID) && !access.isSchoolAdmin) {
    return <AccessDenied message="No permission to view this class attendance." />;
  }

  return (
    <PremiumScreenLayout
      title={`${className} — Detail`}
      subtitle={formatDisplayDate(detail.attendanceDate || date)}
      onBack={() => router.back()}
      scrollable={false}
      rightAction={
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/mark",
              params: { classId: String(classID), className, date, marked: "1" },
            })
          }
          className="px-3 py-2 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
        >
          <Text className="text-white text-[10px] font-black uppercase">Edit</Text>
        </TouchableOpacity>
      }
    >
      <View className="bg-white border border-gray-150 rounded-2xl p-4 mb-3 mx-1">
        <Text className="text-xs font-bold text-gray-400 uppercase">Marked by</Text>
        <Text className="text-sm font-black text-gray-800">{detail.takenBy || "—"}</Text>
        <Text className="text-xs font-bold text-gray-400 uppercase mt-2">Last updated</Text>
        <Text className="text-sm font-semibold text-gray-700">{detail.lastUpdatedBy || "—"}</Text>
      </View>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={detail.students}
          keyExtractor={(item) => String(item.studentID)}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const label = normalizeAttendanceStatusFromApi(item.attendanceStatus);
            const isPresent = label === "Present";
            return (
              <View className="flex-row items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 mb-2 mx-1">
                <View>
                  <Text className="text-sm font-black text-gray-900">{getAttendanceRowName(item)}</Text>
                  <Text className="text-xs text-gray-400">Roll {getAttendanceRowRoll(item)}</Text>
                </View>
                <Text
                  className={`text-xs font-black uppercase ${
                    isPresent ? "text-emerald-600" : label === "Leave" ? "text-amber-600" : "text-rose-600"
                  }`}
                >
                  {label}
                </Text>
              </View>
            );
          }}
        />
      )}
    </PremiumScreenLayout>
  );
}
