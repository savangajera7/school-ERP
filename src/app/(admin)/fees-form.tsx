import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  usePostApiFeesInsertFees, 
  usePutApiFeesUpdateFees, 
  useGetApiFeesGetFeesByIdId 
} from "@/api/generated/fees/fees";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";

export default function FeesFormScreen() {
  const { id } = useLocalSearchParams();
  const feesID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!feesID;

  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [studentID, setStudentID] = useState("");
  const [amount, setAmount] = useState("");
  const [feesType, setFeesType] = useState("Tution Fees");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");

  const insertFees = usePostApiFeesInsertFees();
  const updateFees = usePutApiFeesUpdateFees();
  const { data: feesResponse, isLoading: loadingFees } = useGetApiFeesGetFeesByIdId(feesID as number, {
    query: { enabled: isEditing }
  });

  useEffect(() => {
    if (feesResponse?.data) {
      const f = parseApiData(feesResponse.data) as any;
      setStudentID(String(f.studentID || ""));
      setAmount(String(f.amount || ""));
      setFeesType(f.feesType || "Tution Fees");
      setPaymentMethod(f.paymentMethod || "Cash");
      setPaymentDate(f.paymentDate ? String(f.paymentDate).slice(0, 10) : "");
      setRemarks(f.remarks || "");
    }
  }, [feesResponse]);

  const handleSubmit = async () => {
    if (!studentID || !amount) {
      Alert.alert("Missing Fields", "Please complete all required fields (*).");
      return;
    }

    const payload = {
      studentID: parseInt(studentID),
      amount: parseFloat(amount),
      feesType,
      paymentMethod,
      paymentDate,
      remarks,
      isActive: true,
      createdBy: parseInt(userData?.id || "0"),
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateFees.mutateAsync({
          data: { ...payload, feesID: feesID as number, updatedBy: parseInt(userData?.id || "0") }
        });
        Alert.alert("Success", "Fee record updated successfully!");
      } else {
        await insertFees.mutateAsync({
          data: payload
        });
        Alert.alert("Success", "Fee payment recorded successfully!");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "record"} fees`);
    }
  };

  if (loadingFees) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching fee details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Fee Record" : "Fee Collection"}
      subtitle={isEditing ? "Modify existing payment data" : "Record a new student fee payment"}
      onBack={() => router.back()}
      flatHeader
      keyboard
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Card className="p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
            <AppIcon name="fees" size={22} color={Colors.primary} active />
            <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Payment Details</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text style={styles.label}>Student ID *</Text>
              <TextInput
                value={studentID}
                onChangeText={setStudentID}
                placeholder="Enter Student ID"
                keyboardType="numeric"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View>
              <Text style={styles.label}>Amount (₹) *</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="5000.00"
                keyboardType="numeric"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800"
              />
            </View>

            <View>
              <Text style={styles.label}>Fees Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {["Tution Fees", "Exam Fees", "Transport", "Other"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setFeesType(t)}
                    className={`px-4 py-2 rounded-lg border ${feesType === t ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    <Text className={`text-xs font-bold ${feesType === t ? "text-blue-700" : "text-gray-500"}`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Payment Method</Text>
              <View className="flex-row flex-wrap gap-2">
                {["Cash", "Cheque", "Online", "Bank Transfer"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setPaymentMethod(m)}
                    className={`px-4 py-2 rounded-lg border ${paymentMethod === m ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    <Text className={`text-xs font-bold ${paymentMethod === m ? "text-emerald-700" : "text-gray-500"}`}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Payment Date</Text>
              <TextInput
                value={paymentDate}
                onChangeText={setPaymentDate}
                placeholder="YYYY-MM-DD"
                className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
              />
            </View>

            <View>
              <Text style={styles.label}>Remarks / Note</Text>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Optional notes..."
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800"
              />
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
                {isEditing ? "Update Record" : "Record Payment"}
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
