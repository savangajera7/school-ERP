import React, { useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { 
  useGetApiUserGetUserByIdId, 
  usePutApiUserUpdateUser, 
  useDeleteApiUserDeleteUser 
} from "@/api/generated/user/user";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { parseApiList, parseApiData } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { AppIcon } from "@/components/icons/AppIcon";

const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  userName: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().optional(),
  roleID: z.number().min(1, "Role is required"),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams();
  const userID = parseInt(typeof id === "string" ? id : id?.[0] || "0");
  const { userData } = useAuthStore();
  
  const { data: userResponse, isLoading: loadingUser, refetch } = useGetApiUserGetUserByIdId(userID);
  const { data: rolesData } = useGetApiRoleGetRoleList();
  const updateUser = usePutApiUserUpdateUser();
  const deleteUser = useDeleteApiUserDeleteUser();

  const user = parseApiData(userResponse?.data) as any;
  const roles = parseApiList(rolesData?.data);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      reset({
        fullName: String(user.fullName || ""),
        email: String(user.email || ""),
        mobileNo: String(user.mobileNo || ""),
        userName: String(user.userName || ""),
        roleID: Number(user.roleID || 0),
      });
    }
  }, [user]);

  const onUpdate = async (data: UserFormData) => {
    try {
      await updateUser.mutateAsync({
        data: {
          ...data,
          userID,
          updatedBy: parseInt(userData?.id || "0"),
        } as any,
      });
      Alert.alert("Success", "User updated successfully");
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update user");
    }
  };

  const onDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser.mutateAsync({
                data: {
                  userID,
                  updatedBy: parseInt(userData?.id || "0"),
                }
              });
              Alert.alert("Deleted", "User has been removed");
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete user");
            }
          }
        }
      ]
    );
  };

  return (
    <PremiumScreenLayout
      title="User Details"
      subtitle={user?.fullName || "Manage platform user"}
      onBack={() => router.back()}
      keyboard
    >
      {loadingUser ? (
        <SkeletonLoader rows={6} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Card className="p-6">
            <FormField
              control={control}
              name="fullName"
              label="Full Name"
              placeholder="Enter full name"
            />
            <FormField
              control={control}
              name="email"
              label="Email Address"
              placeholder="Enter email address"
              keyboardType="email-address"
            />
            <FormField
              control={control}
              name="mobileNo"
              label="Mobile Number"
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />
            <FormField
              control={control}
              name="userName"
              label="Username"
              placeholder="Enter username"
            />
            <FormField
              control={control}
              name="password"
              label="New Password (optional)"
              placeholder="Leave blank to keep current"
              isPassword
            />
            
            <View className="mt-4">
              <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Role</Text>
              <View className="flex-row flex-wrap gap-2">
                {roles.map((role: any) => (
                  <TouchableOpacity
                    key={role.roleID}
                    onPress={() => reset({ ...control._formValues, roleID: role.roleID })}
                    className={`px-4 py-2 rounded-xl border ${
                      control._formValues.roleID === role.roleID 
                        ? "bg-primary border-primary" 
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${
                      control._formValues.roleID === role.roleID ? "text-white" : "text-gray-600"
                    }`}>
                      {role.roleName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.roleID && (
                <Text className="text-red-500 text-[10px] mt-1 font-bold">{errors.roleID.message}</Text>
              )}
            </View>

            <View className="flex-row gap-3 mt-8">
              <Button
                label="Update User"
                onPress={handleSubmit(onUpdate)}
                loading={updateUser.isPending}
                style={{ flex: 2 }}
              />
              <TouchableOpacity
                onPress={onDelete}
                className="bg-red-50 border border-red-100 p-3 rounded-2xl items-center justify-center"
                style={{ flex: 0.5 }}
              >
                <AppIcon name="delete" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      )}
    </PremiumScreenLayout>
  );
}
