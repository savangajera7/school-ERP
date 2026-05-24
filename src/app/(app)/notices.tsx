import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const MOCK_SCHOOL_NOTICES = [
  {
    id: "not_1",
    date: "29/04/2026 (01:33 PM)",
    author: "BARIYA URVASHI",
    title: "Result Notice",
    description: "સુપ્રભાત વાલી ગણ સવિનય સાથે જણાવવાનું કે આપણી શાળામાં આવતીકાલે પરીક્ષાનું પરિણામ પત્ર આપવામાં આવી રહ્યું છે જેનો સમય સવારે 11:00 વાગ્યા થી 2:00 વાગ્યા સુધીનો રહેશે. જે પણ વાલી એ પોતાના બાળકની અપડેશન ફી ના ભરી હોય એમણે આવતીકાલે ભરી દેવાની રહેશે.",
  },
  {
    id: "not_2",
    date: "28/04/2026 (10:21 AM)",
    author: "BARIYA URVASHI",
    title: "Updation Notice",
    description: "Hello parents, the results of the second unit test examination are ready. Parents are requested to visit school tomorrow to collect the report progress cards and consult the class teachers.",
  }
];

const MOCK_CLASS_NOTICES = [
  {
    id: "not_3",
    date: "12/05/2026 (02:15 PM)",
    author: "PRIYA SHARMA",
    title: "Mathematics Home Assignment",
    description: "Dear students of Class I-A, please complete the worksheets of Chapter 4 (Subtraction) and submit it by Friday morning.",
  }
];

import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNoticeGet } from "@/api/generated/erp-notice/erp-notice";

export default function StudentNoticeHistoryScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<"school" | "class">("school");
  
  const { data: noticesData, isLoading } = useNoticeGet({});

  const currentNotices = activeTab === "school" ? MOCK_SCHOOL_NOTICES : MOCK_CLASS_NOTICES;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        className="px-6 pt-6 pb-12 rounded-b-[32px]"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/20"
          >
            <Text className="text-white font-bold">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-white">Notice Board</Text>
            <Text className="text-white/60 text-xs font-bold uppercase tracking-wider mt-0.5">
              School Announcements & Logs
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View className="px-6 -mt-6">
        <View className="bg-white p-2 rounded-2xl flex-row shadow-lg shadow-gray-200/50 border border-gray-50">
          <TouchableOpacity 
            onPress={() => setActiveTab("school")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'school' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'school' ? 'text-primary' : 'text-gray-400'}`}>School Notice</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("class")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'class' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'class' ? 'text-primary' : 'text-gray-400'}`}>Class Notice</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 mt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[800px] w-full self-center pb-10 gap-4">
          
          {currentNotices.map((notice) => (
            <Card key={notice.id} className="bg-white border border-gray-150 p-5 rounded-2xl relative overflow-hidden flex-row">
              {/* Left Accent indicator line */}
              <View className="w-1 bg-[#0d3666] absolute left-0 top-0 bottom-0" />
              
              <View className="flex-1 pl-2">
                {/* Meta details header */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs">📅</Text>
                    <Text className="text-xs text-gray-400 font-bold">{notice.date}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[10px] text-gray-400">👤</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">{notice.author}</Text>
                  </View>
                </View>

                {/* Title */}
                <Text className="text-[15px] font-bold text-gray-900 mb-2">{notice.title}</Text>
                
                {/* Description Box */}
                <View className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                  <Text className="text-sm text-gray-700 leading-6 font-medium">{notice.description}</Text>
                </View>
              </View>
            </Card>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
