import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";

const CLASSES = ["Class I-A", "Class II-B", "Class III-A", "Class IV-B"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MOCK_TIMETABLE: Record<string, Array<{ time: string; subject: string; teacher: string; room: string }>> = {
  Monday: [
    { time: "09:00 AM - 09:50 AM", subject: "Mathematics", teacher: "Priya Sharma", room: "Room 101" },
    { time: "10:00 AM - 10:50 AM", subject: "English Literature", teacher: "Ramesh Kumar", room: "Room 101" },
    { time: "11:15 AM - 12:00 PM", subject: "Science (EVS)", teacher: "Ananya Verma", room: "Science Lab" },
    { time: "12:00 PM - 12:45 PM", subject: "Lunch Break", teacher: "-", room: "Cafeteria" },
    { time: "12:45 PM - 01:30 PM", subject: "Gujarati / Hindi", teacher: "Bhavna Patel", room: "Room 101" },
  ],
  Tuesday: [
    { time: "09:00 AM - 09:50 AM", subject: "Science (EVS)", teacher: "Ananya Verma", room: "Science Lab" },
    { time: "10:00 AM - 10:50 AM", subject: "Mathematics", teacher: "Priya Sharma", room: "Room 101" },
    { time: "11:15 AM - 12:00 PM", subject: "Computer Studies", teacher: "Kunal Shah", room: "Computer Lab" },
    { time: "12:00 PM - 12:45 PM", subject: "Lunch Break", teacher: "-", room: "Cafeteria" },
  ],
  Wednesday: [
    { time: "09:00 AM - 09:50 AM", subject: "English Literature", teacher: "Ramesh Kumar", room: "Room 101" },
    { time: "10:00 AM - 10:50 AM", subject: "Art & Craft", teacher: "Sarla Vyas", room: "Art Studio" },
    { time: "11:15 AM - 12:00 PM", subject: "Mathematics", teacher: "Priya Sharma", room: "Room 101" },
    { time: "12:00 PM - 12:45 PM", subject: "Lunch Break", teacher: "-", room: "Cafeteria" },
  ],
  Thursday: [
    { time: "09:00 AM - 09:50 AM", subject: "Physical Education", teacher: "Devang Patel", room: "Playground" },
    { time: "10:00 AM - 10:50 AM", subject: "Gujarati / Hindi", teacher: "Bhavna Patel", room: "Room 101" },
    { time: "11:15 AM - 12:00 PM", subject: "Science (EVS)", teacher: "Ananya Verma", room: "Room 101" },
  ],
  Friday: [
    { time: "09:00 AM - 09:50 AM", subject: "Mathematics", teacher: "Priya Sharma", room: "Room 101" },
    { time: "10:00 AM - 10:50 AM", subject: "Music & Dance", teacher: "Neha Mehta", room: "Auditorium" },
    { time: "11:15 AM - 12:00 PM", subject: "English Literature", teacher: "Ramesh Kumar", room: "Room 101" },
  ],
  Saturday: [
    { time: "09:00 AM - 09:50 AM", subject: "Weekly Assessment", teacher: "All Staff", room: "Room 101" },
    { time: "10:00 AM - 10:50 AM", subject: "Extra-Curricular Activity", teacher: "Devang Patel", room: "Playground" },
  ]
};

export default function TimetableScreen() {
  const { isMobile } = useBreakpoint();
  const [selectedClass, setSelectedClass] = useState("Class I-A");
  const [selectedDay, setSelectedDay] = useState("Monday");

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <ScreenHeader 
        title="School Timetable" 
        subtitle="Weekly class schedules and lecture slots"
        onBack={() => router.push("/(app)/dashboard")}
      />

      <ScrollView className="flex-1 px-4 mt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Selector Configurations */}
          <Card className="bg-white border border-gray-150 p-5 mb-6">
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center justify-between"}`}>
              <View className="flex-1">
                <Text className="text-[12px] font-black text-gray-400 mb-3.5 uppercase tracking-wider">Select Standard</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CLASSES.map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      className={`px-5 py-2.5 rounded-xl border-[1.5px] ${
                        selectedClass === cls 
                          ? "bg-[#0d3666] border-[#0d3666]" 
                          : "bg-gray-50/50 border-gray-200"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-black uppercase tracking-wider ${
                        selectedClass === cls ? "text-white" : "text-gray-500"
                      }`}>
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-1">
                <Text className="text-[12px] font-black text-gray-400 mb-3.5 uppercase tracking-wider">Select Weekday</Text>
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
          </Card>

          {/* Lecture Timeline List */}
          <View className="mb-4 px-1">
            <Text className="text-[16px] font-black text-gray-900">{selectedDay}'s Lecture Schedule</Text>
            <Text className="text-[12px] text-gray-400 font-bold mt-0.5">Showing timetable for {selectedClass}</Text>
          </View>

          {/* Lecture Slot List */}
          {isMobile ? (
            <View className="gap-2">
              {(MOCK_TIMETABLE[selectedDay] || []).map((slot, index) => (
                <MobileDataCard
                  key={index}
                  title={slot.subject}
                  subtitle={slot.time}
                  icon={
                    <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                      slot.subject === "Lunch Break" ? "bg-amber-50" : "bg-blue-50"
                    }`}>
                      <Text className="text-base">{slot.subject === "Lunch Break" ? "🥪" : "📚"}</Text>
                    </View>
                  }
                  badge={
                    <View className="bg-gray-50 px-2 py-1 rounded border border-gray-100">
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
            </View>
          ) : (
            <Card noPadding className="bg-white border border-gray-100 overflow-hidden">
              {/* Header Row */}
              <View className="flex-row items-center px-5 py-4 bg-gray-50 border-b border-gray-150">
                <Text className="w-[200px] text-xs font-black text-gray-400 uppercase">Time Slot</Text>
                <Text className="flex-1 text-xs font-black text-gray-400 uppercase">Subject</Text>
                <Text className="w-[180px] text-xs font-black text-gray-400 uppercase text-center">Teacher</Text>
                <Text className="w-[120px] text-xs font-black text-gray-400 uppercase text-right">Classroom</Text>
              </View>

              {/* Timetable Slots */}
              {(MOCK_TIMETABLE[selectedDay] || []).map((slot, index) => (
                <View 
                  key={index} 
                  className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${
                    slot.subject === 'Lunch Break' ? 'bg-amber-50/20' : index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                  }`}
                >
                  <Text className="w-[200px] text-sm font-black text-[#0d3666]">{slot.time}</Text>
                  
                  <View className="flex-1 flex-row items-center gap-3.5">
                    <View className={`w-9 h-9 rounded-xl items-center justify-center ${
                      slot.subject === 'Lunch Break' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <Text className="text-sm">{slot.subject === 'Lunch Break' ? '🥪' : '📚'}</Text>
                    </View>
                    <Text className="text-sm font-extrabold text-gray-850">{slot.subject}</Text>
                  </View>

                  <Text className="w-[180px] text-sm text-gray-500 font-bold text-center">{slot.teacher}</Text>
                  <Text className="w-[120px] text-sm text-gray-700 font-extrabold text-right">{slot.room}</Text>
                </View>
              ))}
            </Card>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
