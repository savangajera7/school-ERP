import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiTeacherInsertTeacher, 
  usePutApiTeacherUpdateTeacher, 
  useGetApiTeacherGetTeacherByIdId 
} from "@/api/generated/teacher/teacher";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";

export default function TeacherFormScreen() {
  const { id } = useLocalSearchParams();
  const teacherID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!teacherID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [gender, setGender] = useState("Male");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setExperience] = useState("");
  const [subject, setSubject] = useState("");

  const insertTeacher = usePostApiTeacherInsertTeacher();
  const updateTeacher = usePutApiTeacherUpdateTeacher();
  const { data: teacherResponse, isLoading: loadingTeacher } = useGetApiTeacherGetTeacherByIdId(teacherID as number, {
    query: { enabled: isEditing }
  });

  useEffect(() => {
    if (teacherResponse?.data) {
      const t = parseApiData(teacherResponse.data) as any;
      setFirstName(t.firstName || "");
      setLastName(t.lastName || "");
      setTeacherCode(t.teacherCode || "");
      setGender(t.gender || "Male");
      setMobileNo(t.mobileNo || "");
      setEmail(t.email || "");
      setExperience(String(t.experienceYear || ""));
      setSubject(t.subjectName || "");
    }
  }, [teacherResponse]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !teacherCode || !mobileNo) {
      Alert.alert("Missing Fields", "Please complete all required fields (*).");
      return;
    }

    const payload = {
      firstName,
      lastName,
      teacherCode,
      gender,
      mobileNo,
      email,
      experienceYear: parseInt(qualification) || 0,
      subjectName: subject,
      isActive: true,
      createdBy: parseInt(userData?.id || "0"),
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateTeacher.mutateAsync({
          data: { ...payload, teacherID: teacherID as number, updatedBy: parseInt(userData?.id || "0") }
        });
        Alert.alert("Success", "Teacher records updated successfully!");
      } else {
        await insertTeacher.mutateAsync({
          data: payload
        });
        Alert.alert("Success", "Teacher registered successfully!");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "register"} teacher`);
    }
  };

  if (loadingTeacher) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching teacher details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Teacher" : "Teacher Form"}
      subtitle={isEditing ? "Modify faculty member details" : "Register a new faculty member"}
      onBack={() => router.back()}
      keyboard
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
            <AppIcon name="teachers" size={22} color={Colors.primary} active />
            <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Faculty Details</Text>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>Staff ID / Code *</Text>
                <TextInput
                  value={teacherCode}
                  onChangeText={setTeacherCode}
                  placeholder="T-001"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Gender *</Text>
                <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
                  {["Male", "Female"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      className={`flex-1 items-center justify-center rounded-lg ${gender === g ? "bg-[#1A3C6E]" : ""}`}
                    >
                      <Text className={`text-xs font-black uppercase ${gender === g ? "text-white" : "text-gray-500"}`}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                value={mobileNo}
                onChangeText={setMobileNo}
                placeholder="9876543210"
                keyboardType="phone-pad"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john.doe@school.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>Primary Subject</Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Mathematics"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Experience (Yrs)</Text>
                <TextInput
                  value={qualification}
                  onChangeText={setExperience}
                  placeholder="5"
                  keyboardType="numeric"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-[52px] rounded-xl items-center justify-center shadow-lg flex-row gap-2 mt-8"
            style={{ backgroundColor: Colors.primary }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update Faculty" : "Register Teacher"}
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
