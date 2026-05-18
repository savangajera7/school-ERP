import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdmissionFormScreen() {
  const { isMobile } = useBreakpoint();
  const [loading, setLoading] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  const [parentName, setParentName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [formNo, setFormNo] = useState("LAES-2026-089");
  const [batchId, setBatchId] = useState("");
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API Call based on api_contracts.md
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Student Admission Registered Successfully!");
      router.push("/(app)/dashboard");
    }, 1500);
  };

  const formContent = (
    <>
      <Card className="bg-white border border-gray-100 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-50 pb-4">
          <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center">
            <Text className="text-xl">👦</Text>
          </View>
          <Text className="text-[18px] font-bold text-gray-900">Personal Details</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[250px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Student Full Name *</Text>
            <TextInput
              value={studentName}
              onChangeText={setStudentName}
              placeholder="e.g. Pooja Patel"
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Gender *</Text>
            <View className="flex-row bg-gray-50 border border-gray-100 rounded-xl overflow-hidden h-[48px]">
              {["Male", "Female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 items-center justify-center ${gender === g ? "bg-[#0d3666]" : ""}`}
                >
                  <Text className={`text-sm font-bold ${gender === g ? "text-white" : "text-gray-500"}`}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Date of Birth *</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
      </Card>

      <Card className="bg-white border border-gray-100 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-50 pb-4">
          <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center">
            <Text className="text-xl">👨‍👩‍👧</Text>
          </View>
          <Text className="text-[18px] font-bold text-gray-900">Parent Details</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[250px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Father / Guardian Name *</Text>
            <TextInput
              value={parentName}
              onChangeText={setParentName}
              placeholder="e.g. Amit Patel"
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Mobile Number *</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="e.g. 9876543255"
              keyboardType="phone-pad"
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[250px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. amit.patel@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
      </Card>

      <Card className="bg-white border border-gray-100 p-6 mb-10">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-50 pb-4">
          <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center">
            <Text className="text-xl">📚</Text>
          </View>
          <Text className="text-[18px] font-bold text-gray-900">Academic Registration</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Admission Form No.</Text>
            <TextInput
              value={formNo}
              onChangeText={setFormNo}
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold text-gray-800"
              editable={false}
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Assign Batch / Class *</Text>
            <TextInput
              value={batchId}
              onChangeText={setBatchId}
              placeholder="e.g. Class I"
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-xs font-bold text-gray-500 mb-1.5">Admission Date</Text>
            <TextInput
              value={admissionDate}
              onChangeText={setAdmissionDate}
              className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
      </Card>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              <Text className="text-[18px] font-bold text-gray-900">Student Admission Form</Text>
              <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
                Register a new student into the school system
              </Text>
            </View>
          </View>

          {!isMobile && (
            <Button
              label="Complete Registration"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              className="px-6"
            />
          )}
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="max-w-[1000px] w-full self-center">
            {formContent}

            {isMobile && (
              <View className="mb-10">
                <Button
                  label="Complete Registration"
                  onPress={handleSubmit}
                  loading={loading}
                  variant="primary"
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
