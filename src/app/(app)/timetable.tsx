import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">School Timetable</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              Weekly class schedules and lecture slots
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Selector Configurations */}
          <Card className="bg-white border border-gray-100 p-5 mb-6">
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center justify-between"}`}>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Select Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CLASSES.map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedClass === cls ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text className={`text-sm font-bold ${selectedClass === cls ? "text-white" : "text-gray-700"}`}>
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Select Day</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedDay === day ? "bg-[#f5921e] border-orange-500" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text className={`text-sm font-bold ${selectedDay === day ? "text-white" : "text-gray-700"}`}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Card>

          {/* Lecture Timeline List */}
          <View className="mb-4">
            <Text className="text-base font-bold text-gray-800 px-1 mb-1">{selectedDay}'s Lecture Schedule</Text>
            <Text className="text-xs text-gray-400 font-semibold px-1">Showing timetable for {selectedClass}</Text>
          </View>

          <Card className="bg-white border border-gray-100 overflow-hidden">
            {/* Header Row */}
            <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
              <Text className="w-[180px] text-xs font-bold text-gray-400 uppercase">Time Slot</Text>
              <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Subject</Text>
              <Text className="w-[150px] text-xs font-bold text-gray-400 uppercase text-center">Teacher</Text>
              <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-right">Classroom</Text>
            </View>

            {/* Timetable Slots */}
            {(MOCK_TIMETABLE[selectedDay] || []).map((slot, index) => (
              <View 
                key={index} 
                className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
              >
                <Text className="w-[180px] text-sm font-bold text-[#0d3666]">{slot.time}</Text>
                
                <View className="flex-1 flex-row items-center gap-3">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${
                    slot.subject === 'Lunch Break' ? 'bg-orange-50' : 'bg-indigo-50'
                  }`}>
                    <Text className="text-sm">{slot.subject === 'Lunch Break' ? '🥪' : '📚'}</Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-800">{slot.subject}</Text>
                </View>

                <Text className="w-[150px] text-sm text-gray-500 font-semibold text-center">{slot.teacher}</Text>
                <Text className="w-[120px] text-sm text-gray-700 font-bold text-right">{slot.room}</Text>
              </View>
            ))}
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
