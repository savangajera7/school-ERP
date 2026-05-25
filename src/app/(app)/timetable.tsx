import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Card";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { useResponsive } from "@/hooks/useResponsive";
import { SubjectSlotIcon, AppIcon } from "@/components/icons/AppIcon";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "@/hooks/useTranslation";
import { ClassModel } from "@/api/model/classModel";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableScreen() {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { isSchoolAdmin, isStudent, isParent } = usePermissions();
  
  const [selectedClassID, setSelectedClassID] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || "Monday");
  const [timetableData, setTimetableData] = useState<Record<string, Array<{ time: string; subject: string; teacher: string; room: string }>>>({});

  const { data: classData, isLoading: loadingClasses } = useGetApiClassGet();
  const classes = useMemo(() => parseApiList<ClassModel>(classData), [classData]);

  useEffect(() => {
    if (classes.length > 0 && selectedClassID === null) {
      setSelectedClassID(classes[0].classID || null);
    }
  }, [classes]);

  const selectedClassName = useMemo(() => {
    return classes.find(c => c.classID === selectedClassID)?.className || "Select Class";
  }, [classes, selectedClassID]);

  // TODO: Connect to real timetable API once generated
  const currentDaySlots = timetableData[selectedDay] || [];

  return (
    <PremiumScreenLayout
      title={t.timetable}
      subtitle="Weekly class schedules and lecture slots"
      hideBack={isMobile}
      withTabBar
      rightAction={
        isSchoolAdmin ? (
          <TouchableOpacity 
            className="flex-row items-center gap-2 bg-[#134A8C] px-4 py-2 rounded-xl"
            activeOpacity={0.8}
          >
            <AppIcon name="compose" size={16} color="white" active />
            <Text className="text-white text-xs font-black uppercase">Manage</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
          <PremiumCard noAccent style={{ padding: 16, marginBottom: 14 }}>
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center justify-between"}`}>
              {/* Standard/Class Selector */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-3.5">
                  <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t.classId}</Text>
                  {loadingClasses && <ActivityIndicator size="small" color="#134A8C" />}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {classes.map((cls) => (
                    <TouchableOpacity
                      key={cls.classID}
                      onPress={() => setSelectedClassID(cls.classID || null)}
                      className={`px-5 py-2.5 rounded-xl border-[1.5px] ${
                        selectedClassID === cls.classID 
                          ? "bg-[#0d3666] border-[#0d3666]" 
                          : "bg-gray-50/50 border-gray-200"
                      }`}
                      activeOpacity={0.8}
                      disabled={isStudent || isParent}
                    >
                      <Text className={`text-xs font-black uppercase tracking-wider ${
                        selectedClassID === cls.classID ? "text-white" : "text-gray-500"
                      }`}>
                        {cls.className}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {classes.length === 0 && !loadingClasses && (
                    <Text className="text-xs text-gray-400 font-bold italic">No classes found</Text>
                  )}
                </ScrollView>
              </View>

              {/* Weekday Selector */}
              <View className="flex-1">
                <Text className="text-[11px] font-black text-gray-400 mb-3.5 uppercase tracking-wider">Select Weekday</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      className={`px-5 py-2.5 rounded-xl border-[1.5px] ${
                        selectedDay === day 
                          ? "bg-[#f5921e] border-[#f5921e]" 
                          : "bg-gray-50/50 border-gray-200"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-black uppercase tracking-wider ${
                        selectedDay === day ? "text-white" : "text-gray-500"
                      }`}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </PremiumCard>

          {/* Lecture timeline */}
          <View className="mb-4 px-1 flex-row items-center justify-between">
            <View>
              <Text className="text-[16px] font-black text-gray-900">{selectedDay}'s Lecture Schedule</Text>
              <Text className="text-[12px] text-gray-400 font-bold mt-0.5">
                Showing timetable for <Text className="text-[#134A8C]">{selectedClassName}</Text>
              </Text>
            </View>
            {(isStudent || isParent) && (
              <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Text className="text-[10px] font-black text-blue-600 uppercase">My Class</Text>
              </View>
            )}
          </View>

          {/* Lecture Slot List */}
          {isMobile ? (
            <View className="gap-2">
              {currentDaySlots.map((slot, index) => (
                <MobileDataCard
                  key={index}
                  title={slot.subject}
                  subtitle={slot.time}
                  accentColor={slot.subject === "Lunch Break" ? "#F5921E" : "#134A8C"}
                  icon={
                    <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                      slot.subject === "Lunch Break" ? "bg-amber-50 border border-amber-100" : "bg-blue-50 border border-blue-100"
                    }`}>
                      <SubjectSlotIcon subject={slot.subject} size={22} />
                    </View>
                  }
                  badge={
                    <View className="bg-gray-55 px-2 py-1 rounded border border-gray-100">
                      <Text className="text-[10px] font-black text-gray-500 uppercase">{slot.room}</Text>
                    </View>
                  }
                  fields={
                    slot.subject !== "Lunch Break" 
                      ? [{ label: "Instructor", value: slot.teacher }]
                      : []
                  }
                />
              ))}
              {currentDaySlots.length === 0 && (
                <View className="bg-white border border-gray-150 p-10 items-center rounded-3xl mt-2">
                  <AppIcon name="empty" size={44} color="#9CA3AF" />
                  <Text className="text-gray-400 font-black text-xs uppercase mt-2">No lectures scheduled</Text>
                </View>
              )}
            </View>
          ) : (
            <Card noPadding className="bg-white border border-gray-150 overflow-hidden rounded-3xl shadow-sm">
              {/* Header Row */}
              <View className="flex-row items-center px-6 py-4 bg-gray-50 border-b border-gray-100">
                <Text className="w-[200px] text-[10px] font-black text-gray-400 uppercase tracking-wider">Time Slot</Text>
                <Text className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">Subject</Text>
                <Text className="w-[180px] text-[10px] font-black text-gray-400 uppercase text-center tracking-wider">Teacher</Text>
                <Text className="w-[120px] text-[10px] font-black text-gray-400 uppercase text-right tracking-wider">Classroom</Text>
              </View>

              {/* Timetable Slots */}
              {currentDaySlots.map((slot, index) => (
                <View 
                  key={index} 
                  className={`flex-row items-center px-6 py-4 border-b border-gray-50 ${
                    slot.subject === 'Lunch Break' ? 'bg-amber-50/20' : index % 2 === 0 ? "bg-white" : "bg-gray-50/10"
                  }`}
                >
                  <Text className="w-[200px] text-sm font-black text-[#0d3666]">{slot.time}</Text>
                  
                  <View className="flex-1 flex-row items-center gap-3.5">
                    <View className={`w-9 h-9 rounded-xl items-center justify-center border ${
                      slot.subject === 'Lunch Break' ? 'bg-amber-100 border-amber-200' : 'bg-blue-100 border-blue-200'
                    }`}>
                      <SubjectSlotIcon subject={slot.subject} size={18} />
                    </View>
                    <Text className="text-sm font-extrabold text-gray-800">{slot.subject}</Text>
                  </View>

                  <Text className="w-[180px] text-sm text-gray-500 font-bold text-center">{slot.teacher}</Text>
                  <Text className="w-[120px] text-sm text-gray-700 font-black text-right uppercase tracking-tighter">{slot.room}</Text>
                </View>
              ))}
              {currentDaySlots.length === 0 && (
                <View className="p-12 items-center justify-center">
                   <Text className="text-gray-400 font-black text-xs uppercase">No lectures scheduled for this day</Text>
                </View>
              )}
            </Card>
          )}

    </PremiumScreenLayout>
  );
}
