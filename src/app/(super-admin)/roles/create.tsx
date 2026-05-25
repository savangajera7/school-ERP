import React from "react";
import { ScrollView, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { usePostApiRoleInsertRole } from "@/api/generated/role/role";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";

const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  roleCode: z.string().min(1, "Role code is required"),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function CreateRoleScreen() {
  const { userData } = useAuthStore();
  const insertRole = usePostApiRoleInsertRole();

  const { control, handleSubmit } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleName: "",
      roleCode: "",
      description: "",
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      await insertRole.mutateAsync({
        data: {
          ...data,
          createdBy: parseInt(userData?.id || "0"),
        },
      });
      Alert.alert("Success", "Role created successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create role");
    }
  };

  return (
    <PremiumScreenLayout
      title="Create Role"
      subtitle="Define a new user access group"
      onBack={() => router.back()}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="p-6">
          <FormField
            control={control}
            name="roleName"
            label="Role Name"
            placeholder="e.g. Accountant"
          />
          <FormField
            control={control}
            name="roleCode"
            label="Role Code"
            placeholder="e.g. ACC"
          />
          <FormField
            control={control}
            name="description"
            label="Description"
            placeholder="What this role can do..."
            multiline
            numberOfLines={3}
          />

          <Button
            label="Create Role"
            onPress={handleSubmit(onSubmit)}
            loading={insertRole.isPending}
            className="mt-8"
          />
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}
