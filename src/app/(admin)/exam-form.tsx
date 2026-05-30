import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiExamInsertExam, 
  usePutApiExamUpdateExam, 
  useGetApiExamGetExamByIdId 
} from "@/api/generated/exam/exam";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";

export default function ExamFormScreen() {
  const { id } = useLocalSearchParams();
  const examID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!examID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { alert } = useDialog();

  // Form State
  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [classID, setClassID] = useState("");
  const [examDate, setExamDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [description, setDescription] = useState("");

  const insertExam = usePostApiExamInsertExam();
  const updateExam = usePutApiExamUpdateExam();
  const { data: examResponse, isLoading: loadingExam } = useGetApiExamGetExamByIdId(examID as number, {
    query: { enabled: isEditing }
  });

  useEffect(() => {
    if (examResponse?.data) {
      const e = parseApiData(examResponse.data) as any;
      setExamName(e.examName || "");
      setExamCode(e.examCode || "");
      setClassID(String(e.classID || ""));
      setExamDate(e.examDate ? String(e.examDate).slice(0, 10) : "");
      setTotalMarks(String(e.totalMarks || "100"));
      setDescription(e.description || "");
    }
  }, [examResponse]);

  const handleSubmit = async () => {
    if (!examName || !examCode || !classID) {
      await alert("Missing Fields", "Please complete all required fields (*).", "warning");
      return;
    }
    const payload = {
      examName, examCode, classID: parseInt(classID), examDate,
      totalMarks: parseInt(totalMarks), description, isActive: true,
      createdBy: parseInt(userData?.id || "0"),
    };
    try {
      setLoading(true);
      if (isEditing) {
        await updateExam.mutateAsync({ data: { ...payload, examID: examID as number, updatedBy: parseInt(userData?.id || "0") } });
        await alert("Success", "Exam details updated successfully!", "success");
      } else {
        await insertExam.mutateAsync({ data: payload });
        await alert("Success", "Exam created successfully!", "success");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      await alert("Error", error.message || `Failed to ${isEditing ? "update" : "create"} exam`, "error");
    }
  };

  if (loadingExam) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching exam details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Exam" : "New Exam"}
      subtitle={isEditing ? "Modify examination schedule" : "Schedule a new examination"}
      onBack={() => router.back()}
      flatHeader
      keyboard
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 dark:border-slate-700 pb-4">
            <AppIcon name="exams" size={22} color={Colors.accent} active />
            <Text className="text-[16px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-wide">Exam Configuration</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text style={styles.label}>Exam Title *</Text>
              <TextInput
                value={examName}
                onChangeText={setExamName}
                placeholder="e.g. Mid-Term 2026"
                placeholderTextColor="#9CA3AF"
                className="h-[48px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>Exam Code *</Text>
                <TextInput
                  value={examCode}
                  onChangeText={setExamCode}
                  placeholder="EX-001"
                  placeholderTextColor="#9CA3AF"
                  className="h-[48px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 text-sm font-bold text-gray-800 dark:text-slate-200"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Class ID *</Text>
                <TextInput
                  value={classID}
                  onChangeText={setClassID}
                  placeholder="10"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="h-[48px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <PremiumDatePicker
                  label="Start Date"
                  value={examDate}
                  onChange={setExamDate}
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Total Marks</Text>
                <TextInput
                  value={totalMarks}
                  onChangeText={setTotalMarks}
                  placeholder="100"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="h-[48px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Guidelines or additional info..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 dark:text-slate-200"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-[52px] rounded-xl items-center justify-center shadow-lg flex-row gap-2 mt-8"
            style={{ backgroundColor: Colors.accent }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Save Changes" : "Schedule Exam"}
              </Text>
            )}
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
