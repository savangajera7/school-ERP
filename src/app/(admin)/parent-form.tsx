import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiParentInsertParent, 
  usePutApiParentUpdateParent, 
  useGetApiParentGetParentByIdId 
} from "@/api/generated/parent/parent";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";

export default function ParentFormScreen() {
  const { id } = useLocalSearchParams();
  const parentID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!parentID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [relation, setRelation] = useState("Father");

  const insertParent = usePostApiParentInsertParent();
  const updateParent = usePutApiParentUpdateParent();
  const { data: parentResponse, isLoading: loadingParent } = useGetApiParentGetParentByIdId(parentID as number, {
    query: { enabled: isEditing }
  });

  useEffect(() => {
    if (parentResponse?.data) {
      const p = parseApiData(parentResponse.data) as any;
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setMobileNo(p.mobileNo || "");
      setEmail(p.email || "");
      setOccupation(p.occupation || "");
      setRelation(p.relation || "Father");
    }
  }, [parentResponse]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !mobileNo) {
      Alert.alert("Missing Fields", "Please complete all required fields (*).");
      return;
    }

    const payload = {
      firstName,
      lastName,
      mobileNo,
      email,
      occupation,
      relation,
      isActive: true,
      createdBy: parseInt(userData?.id || "0"),
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateParent.mutateAsync({
          data: { ...payload, parentID: parentID as number, updatedBy: parseInt(userData?.id || "0") }
        });
        Alert.alert("Success", "Parent records updated successfully!");
      } else {
        await insertParent.mutateAsync({
          data: payload
        });
        Alert.alert("Success", "Parent registered successfully!");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "register"} parent`);
    }
  };

  if (loadingParent) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching guardian details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Guardian" : "Guardian Form"}
      subtitle={isEditing ? "Modify parent/guardian details" : "Register a new student guardian"}
      onBack={() => router.back()}
      flatHeader
      keyboard
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
            <AppIcon name="parents" size={22} color={Colors.accent} active />
            <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Guardian Details</Text>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Amit"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Patel"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Relation *</Text>
              <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
                {["Father", "Mother", "Guardian"].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRelation(r)}
                    className={`flex-1 items-center justify-center rounded-lg ${relation === r ? "bg-[#F5921E]" : ""}`}
                  >
                    <Text className={`text-[10px] font-black uppercase ${relation === r ? "text-white" : "text-gray-500"}`}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                placeholder="amit.patel@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View>
              <Text style={styles.label}>Occupation</Text>
              <TextInput
                value={occupation}
                onChangeText={setOccupation}
                placeholder="Business / Service"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
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
                {isEditing ? "Update Guardian" : "Register Guardian"}
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
