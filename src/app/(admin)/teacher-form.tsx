import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, StyleSheet, Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import {
  usePostApiTeacherInsertTeacher,
  usePutApiTeacherUpdateTeacher,
  useGetApiTeacherGetTeacherByIdId,
} from "@/api/generated/teacher/teacher";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { parseApiData, parseApiList, toCamelCaseRow } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";
import { uploadProfileImage, resolveMediaUrl } from "@/services/upload/uploadService";
import { useResponsive } from "@/hooks/useResponsive";
import * as ImagePicker from "expo-image-picker";

export default function TeacherFormScreen() {
  const { id } = useLocalSearchParams();
  const teacherID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!teacherID;

  const { userData } = useAuthStore();
  const { isMobile } = useResponsive();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Validation errors ─────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Accordion sections ────────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    professional: false,
    account: false,
  });
  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Form state ────────────────────────────────────────────────────────────
  const [teacherCode, setTeacherCode]       = useState("");
  const [firstName, setFirstName]           = useState("");
  const [middleName, setMiddleName]         = useState("");
  const [lastName, setLastName]             = useState("");
  const [gender, setGender]                 = useState("Male");
  const [mobileNo, setMobileNo]             = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [qualification, setQualification]   = useState("");
  const [experienceYear, setExperienceYear] = useState("");
  const [joiningDate, setJoiningDate]       = useState("");
  const [salary, setSalary]                 = useState("");
  const [address, setAddress]               = useState("");
  const [subjectName, setSubjectName]       = useState("");
  const [roleID, setRoleID]                 = useState<number | undefined>();
  const [photo, setPhoto]                   = useState<string | null>(null);

  // ── API hooks ─────────────────────────────────────────────────────────────
  const insertTeacher = usePostApiTeacherInsertTeacher();
  const updateTeacher = usePutApiTeacherUpdateTeacher();
  const { data: rolesData } = useGetApiRoleGetRoleList();
  const { data: teacherResponse, isLoading: loadingTeacher } =
    useGetApiTeacherGetTeacherByIdId(teacherID as number, {
      query: { enabled: isEditing },
    });

  const roles = parseApiList(rolesData?.data);

  useEffect(() => {
    if (teacherResponse?.data) {
      const parsed = parseApiData(teacherResponse.data) as any;
      const t = parsed ? toCamelCaseRow(parsed) as any : {};
      setTeacherCode(t.teacherCode || "");
      setFirstName(t.firstName || "");
      setMiddleName(t.middleName || "");
      setLastName(t.lastName || "");
      setGender(t.gender || "Male");
      setMobileNo(t.mobileNo || "");
      setEmail(t.email || "");
      setPassword(""); // never pre-fill password
      setQualification(t.qualification || "");
      setExperienceYear(String(t.experienceYear || ""));
      setJoiningDate(t.joiningDate ? String(t.joiningDate).slice(0, 10) : "");
      setSalary(String(t.salary || ""));
      setAddress(t.address || "");
      setSubjectName(t.subjectName || "");
      setRoleID(t.roleID || undefined);
      setPhoto(resolveMediaUrl(t.photo) ?? null);
    }
  }, [teacherResponse]);

  // ── Photo picker ──────────────────────────────────────────────────────────
  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    let name = asset.uri.split("/").pop() || `teacher-${Date.now()}.jpg`;
    if (!name.match(/\.(jpg|jpeg|png|gif)$/i)) name = `${name}.jpg`;
    const type = asset.mimeType || "image/jpeg";
    try {
      setUploadingPhoto(true);
      const url = await uploadProfileImage({ uri: asset.uri, name, type });
      setPhoto(url);
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message || "Could not upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim())    newErrors.firstName    = "Required";
    if (!lastName.trim())     newErrors.lastName     = "Required";
    if (!teacherCode.trim())  newErrors.teacherCode  = "Required";
    if (!mobileNo.trim())     newErrors.mobileNo     = "Required";
    if (!isEditing && !password.trim()) newErrors.password = "Required for new teacher";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto-expand sections that have errors
      setExpandedSections((prev) => ({
        ...prev,
        personal: prev.personal || !!(newErrors.firstName || newErrors.lastName || newErrors.teacherCode || newErrors.mobileNo),
        account:  prev.account  || !!newErrors.password,
      }));
      Alert.alert("Missing Fields", "Please complete all required fields highlighted in red.");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setErrors({});

    const base = {
      teacherCode,
      firstName,
      middleName,
      lastName,
      gender,
      mobileNo,
      email,
      qualification,
      experienceYear: parseInt(experienceYear) || 0,
      joiningDate: joiningDate || undefined,
      salary: parseFloat(salary) || 0,
      address,
      subjectName,
      roleID: roleID || undefined,
      photo: photo ?? "",
      createdBy: parseInt(userData?.id || "0"),
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateTeacher.mutateAsync({
          data: {
            ...base,
            teacherID: teacherID as number,
            updatedBy: parseInt(userData?.id || "0"),
            ...(password ? { password } : {}),
          },
        });
        Alert.alert("Success", "Teacher updated successfully!");
      } else {
        await insertTeacher.mutateAsync({ data: { ...base, password } });
        Alert.alert("Success", "Teacher registered successfully!");
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "register"} teacher`);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const renderSectionHeader = (
    title: string,
    icon: any,
    color: string,
    bgColor: string,
    borderColor: string,
    sectionKey: string,
  ) => (
    <TouchableOpacity
      onPress={() => toggleSection(sectionKey)}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-2"
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-10 h-10 ${bgColor} rounded-xl items-center justify-center border ${borderColor}`}>
          <AppIcon name={icon} size={20} color={color} active />
        </View>
        <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">{title}</Text>
      </View>
      <View style={{ transform: [{ rotate: expandedSections[sectionKey] ? "180deg" : "0deg" }] }}>
        <AppIcon name="chevronDown" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    opts?: {
      keyboard?: any;
      maxLength?: number;
      multiline?: boolean;
      secure?: boolean;
      required?: boolean;
      editable?: boolean;
    },
    errorKey?: string,
  ) => {
    const hasError = errorKey ? !!errors[errorKey] : false;
    return (
      <View className="flex-1 min-w-[280px]">
        <Text className={`text-[10px] font-black ${hasError ? "text-red-500" : "text-gray-500"} mb-1.5 uppercase tracking-wide`}>
          {label}{opts?.required ? " *" : ""}
        </Text>
        <TextInput
          value={value}
          onChangeText={(v) => {
            onChange(v);
            if (errorKey) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
          }}
          placeholder={placeholder}
          keyboardType={opts?.keyboard || "default"}
          maxLength={opts?.maxLength}
          multiline={opts?.multiline}
          editable={opts?.editable !== false}
          secureTextEntry={opts?.secure && !showPassword}
          className={`${opts?.multiline ? "min-h-[80px] py-3" : "h-[48px]"} ${
            hasError
              ? "bg-red-50 border-red-400 text-red-900"
              : "bg-gray-50 border-gray-200 text-gray-800"
          } border rounded-xl px-4 text-sm font-semibold`}
          placeholderTextColor={hasError ? "#FCA5A5" : "#9CA3AF"}
        />
        {hasError && (
          <Text className="text-red-500 text-[10px] font-bold mt-1">{errors[errorKey!]}</Text>
        )}
      </View>
    );
  };

  const renderToggle = (
    label: string,
    value: string,
    options: string[],
    onSelect: (v: string) => void,
  ) => (
    <View className="flex-1 min-w-[280px]">
      <Text style={styles.label}>{label}</Text>
      <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            className={`flex-1 items-center justify-center rounded-lg ${value === opt ? "bg-[#1A3C6E]" : ""}`}
          >
            <Text className={`text-xs font-black uppercase ${value === opt ? "text-white" : "text-gray-500"}`}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRoleDropdown = () => (
    <View className="flex-1 min-w-[280px]">
      <Text style={styles.label}>Role</Text>
      <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 10 }}
        >
          {roles.map((r: any) => {
            const rid = r.roleID ?? r.id;
            const rname = r.roleName ?? r.name;
            return (
              <TouchableOpacity
                key={rid}
                onPress={() => setRoleID(rid)}
                className={`px-3 py-1.5 rounded-lg mr-2 ${roleID === rid ? "bg-[#1A3C6E]" : "bg-gray-200"}`}
              >
                <Text className={`text-[11px] font-bold ${roleID === rid ? "text-white" : "text-gray-600"}`}>
                  {rname}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  if (loadingTeacher) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching teacher details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Teacher" : "New Teacher"}
      subtitle={isEditing ? "Modify faculty member details" : "Register a new faculty member"}
      onBack={() => router.back()}
      flatHeader
      keyboard
      scrollable={false}
      rightAction={
        !isMobile ? (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || uploadingPhoto}
            className="px-5 py-2.5 rounded-xl flex-row gap-2 items-center"
            style={{ backgroundColor: Colors.primary, opacity: loading || uploadingPhoto ? 0.7 : 1 }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update" : "Register"}
              </Text>
            )}
          </TouchableOpacity>
        ) : undefined
      }
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── SECTION 1: Personal Details ── */}
        <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
          {renderSectionHeader("Personal Details", "teachers", "#0369A1", "bg-blue-50", "border-blue-100", "personal")}

          {expandedSections.personal && (
            <View className="mt-6 pt-6 border-t border-gray-100">

              {/* Photo */}
              <View className="items-center mb-6">
                <Text style={styles.label} className="mb-2">Profile Photo</Text>
                <TouchableOpacity
                  onPress={pickPhoto}
                  disabled={uploadingPhoto}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50 overflow-hidden"
                  activeOpacity={0.8}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : photo ? (
                    <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center gap-1">
                      <AppIcon name="camera" size={24} color="#9CA3AF" />
                      <Text className="text-[10px] text-gray-400 font-bold">Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {photo && !uploadingPhoto && (
                  <TouchableOpacity onPress={() => setPhoto(null)} className="mt-2">
                    <Text className="text-red-500 text-xs font-bold">Remove Photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Name row */}
              <View className={`flex-row flex-wrap gap-4 mb-4 ${isMobile ? "flex-col" : ""}`}>
                {renderField("First Name", firstName, setFirstName, "John", { required: true }, "firstName")}
                {renderField("Middle Name", middleName, setMiddleName, "Kumar")}
                {renderField("Last Name", lastName, setLastName, "Doe", { required: true }, "lastName")}
              </View>

              {/* Code + Gender */}
              <View className={`flex-row flex-wrap gap-4 mb-4 ${isMobile ? "flex-col" : ""}`}>
                {renderField("Staff ID / Code", teacherCode, setTeacherCode, "T-001", { required: true }, "teacherCode")}
                {renderToggle("Gender", gender, ["Male", "Female", "Other"], setGender)}
              </View>

              {/* Mobile + Email */}
              <View className={`flex-row flex-wrap gap-4 mb-4 ${isMobile ? "flex-col" : ""}`}>
                {renderField("Mobile Number", mobileNo, setMobileNo, "9876543210", { keyboard: "phone-pad", maxLength: 10, required: true }, "mobileNo")}
                {renderField("Email Address", email, setEmail, "john.doe@school.com", { keyboard: "email-address" })}
              </View>

              {/* Address */}
              <View className="mb-4">
                {renderField("Address", address, setAddress, "Full residential address", { multiline: true })}
              </View>
            </View>
          )}
        </Card>

        {/* ── SECTION 2: Professional Details ── */}
        <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
          {renderSectionHeader("Professional Details", "subjects", "#15803D", "bg-emerald-50", "border-emerald-100", "professional")}

          {expandedSections.professional && (
            <View className="mt-6 pt-6 border-t border-gray-100">

              {/* Subject + Qualification */}
              <View className={`flex-row flex-wrap gap-4 mb-4 ${isMobile ? "flex-col" : ""}`}>
                {renderField("Primary Subject", subjectName, setSubjectName, "Mathematics")}
                {renderField("Qualification", qualification, setQualification, "B.Ed, M.Sc")}
              </View>

              {/* Experience + Salary */}
              <View className={`flex-row flex-wrap gap-4 mb-4 ${isMobile ? "flex-col" : ""}`}>
                {renderField("Experience (Years)", experienceYear, setExperienceYear, "5", { keyboard: "numeric" })}
                {renderField("Salary (₹)", salary, setSalary, "25000", { keyboard: "decimal-pad" })}
              </View>

              {/* Joining Date + Role */}
              <View className={`flex-row flex-wrap gap-4 mb-4 ${isMobile ? "flex-col" : ""}`}>
                <View className="flex-1 min-w-[280px]">
                  <PremiumDatePicker
                    label="Joining Date"
                    value={joiningDate}
                    onChange={setJoiningDate}
                    placeholder="Select joining date"
                  />
                </View>
                {renderRoleDropdown()}
              </View>
            </View>
          )}
        </Card>

        {/* ── SECTION 3: Account / Login ── */}
        <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
          {renderSectionHeader("Login Account", "lock", "#B45309", "bg-amber-50", "border-amber-100", "account")}

          {expandedSections.account && (
            <View className="mt-6 pt-6 border-t border-gray-100">
              <View className="flex-row items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5">
                <AppIcon name="warning" size={14} color="#B45309" />
                <Text className="text-xs text-amber-700 font-semibold flex-1">
                  {isEditing
                    ? "Leave password blank to keep the existing password unchanged."
                    : "Set a login password for this teacher. They can change it later."}
                </Text>
              </View>

              <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
                {/* Email shown read-only for reference */}
                <View className="flex-1 min-w-[280px]">
                  <Text style={styles.label}>Login Email (same as above)</Text>
                  <View className="h-[48px] bg-gray-100 border border-gray-200 rounded-xl px-4 justify-center">
                    <Text className="text-sm font-semibold text-gray-500">{email || "—"}</Text>
                  </View>
                </View>

                {/* Password */}
                <View className="flex-1 min-w-[280px]">
                  <Text className={`text-[10px] font-black ${errors.password ? "text-red-500" : "text-gray-500"} mb-1.5 uppercase tracking-wide`}>
                    Password{!isEditing ? " *" : ""}
                  </Text>
                  <View className={`flex-row items-center ${errors.password ? "bg-red-50 border-red-400" : "bg-gray-50 border-gray-200"} border rounded-xl overflow-hidden h-[48px]`}>
                    <TextInput
                      value={password}
                      onChangeText={(v) => {
                        setPassword(v);
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder={isEditing ? "Leave blank to keep current" : "Min 6 characters"}
                      secureTextEntry={!showPassword}
                      className="flex-1 h-full px-4 text-sm font-semibold text-gray-800"
                      placeholderTextColor={errors.password ? "#FCA5A5" : "#9CA3AF"}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((v) => !v)}
                      className="px-3 h-full items-center justify-center"
                    >
                      <AppIcon name={(showPassword ? "eyeOff" : "eye") as any} size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="text-red-500 text-[10px] font-bold mt-1">{errors.password}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* ── Mobile submit button ── */}
        {isMobile && (
          <View className="mb-10 mt-2">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || uploadingPhoto}
              className="h-[52px] rounded-xl items-center justify-center shadow-lg flex-row gap-2"
              style={{ backgroundColor: Colors.primary, opacity: loading || uploadingPhoto ? 0.7 : 1 }}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-black text-xs uppercase tracking-widest">
                  {isEditing ? "Update Teacher" : "Register Teacher"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

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
