import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import type { AttendanceRow } from "@/api/attendance";
import { getAttendanceRowName, getAttendanceRowRoll, isPresentStatus } from "@/api/attendance";
import { GenderIcon } from "@/components/icons/AppIcon";

export type MarkStatus = "Present" | "Absent" | "Leave";

type Props = {
  student: AttendanceRow;
  status: MarkStatus;
  remark: string;
  onStatusChange: (status: MarkStatus) => void;
  onRemarkChange: (remark: string) => void;
};

export function StudentMarkRow({
  student,
  status,
  remark,
  onStatusChange,
  onRemarkChange,
}: Props) {
  const studentId = student.studentID!;
  const showRemark = !isPresentStatus(status);

  return (
    <View className="bg-white border border-gray-150 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 items-center justify-center">
          <GenderIcon gender={student.gender} size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-black text-gray-900">{getAttendanceRowName(student)}</Text>
          <Text className="text-xs font-bold text-gray-400">Roll {getAttendanceRowRoll(student)}</Text>
        </View>
        <View
          className={`px-2.5 py-1 rounded-lg border ${
            status === "Present"
              ? "bg-emerald-50 border-emerald-200"
              : status === "Absent"
                ? "bg-rose-50 border-rose-200"
                : "bg-amber-50 border-amber-200"
          }`}
        >
          <Text
            className={`text-[9px] font-black uppercase ${
              status === "Present" ? "text-emerald-700" : status === "Absent" ? "text-rose-700" : "text-amber-700"
            }`}
          >
            {status}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-3">
        {(["Present", "Absent", "Leave"] as MarkStatus[]).map((opt) => {
          const active = status === opt;
          const bg =
            opt === "Present"
              ? active
                ? "bg-emerald-600 border-emerald-600"
                : "bg-white border-gray-200"
              : opt === "Absent"
                ? active
                  ? "bg-rose-600 border-rose-600"
                  : "bg-white border-gray-200"
                : active
                  ? "bg-amber-500 border-amber-500"
                  : "bg-white border-gray-200";
          return (
            <TouchableOpacity
              key={`${studentId}-${opt}`}
              onPress={() => onStatusChange(opt)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${bg}`}
              activeOpacity={0.85}
            >
              <Text className={`text-xs font-black uppercase ${active ? "text-white" : "text-gray-400"}`}>
                {opt === "Present" ? "P" : opt === "Absent" ? "A" : "L"}
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
