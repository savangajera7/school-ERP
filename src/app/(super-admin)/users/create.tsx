import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { usePostApiUserInsertUser } from "@/api/generated/user/user";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { parseApiList } from "@/utils/apiResponse";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { useResponsive } from "@/hooks/useResponsive";

const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  userName: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleID: z.number().min(1, "Role is required"),
});

type UserFormData = z.infer<typeof userSchema>;

export default function CreateUserScreen() {
  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const { alert } = useDialog();
  const insertUser = usePostApiUserInsertUser();
  const { data: rolesData, isLoading: loadingRoles } = useGetApiRoleGetRoleList();
  
  const roles = parseApiList(rolesData?.data);

  const { control, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobileNo: "",
      userName: "",
      password: "",
      roleID: 0,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await insertUser.mutateAsync({
        data: {
          ...data,
          createdBy: parseInt(userData?.id || "0"),
          isActive: true,
        } as any,
      });
      await alert("Success", "User created successfully", "success");
      router.back();
    } catch (error: any) {
      await alert("Error", error.message || "Failed to create user", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Create User"
      subtitle="Add a new platform administrator or staff member"
      keyboard
      flatHeader
    >
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
            label="Password"
            placeholder="Enter password"
            isPassword
          />
          
          <View className="mt-4">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Select Role</Text>
            <View className="flex-row flex-wrap gap-2">
              {roles.map((role: any) => (
                <TouchableOpacity
                  key={role.roleID}
                  onPress={() => control._reset({ ...control._formValues, roleID: role.roleID })}
                  className={`px-4 py-2 rounded-xl border ${
                    control._formValues.roleID === role.roleID 
                      ? "bg-primary border-primary" 
                      : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
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

          <Button
            label="Create User"
            onPress={handleSubmit(onSubmit)}
            loading={insertUser.isPending}
            className="mt-8"
          />
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}
