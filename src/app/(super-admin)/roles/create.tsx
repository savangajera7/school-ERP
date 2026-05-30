import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { 
  usePostApiRoleInsertRole, 
  usePutApiRoleUpdateRole,
  useGetApiRoleGetRoleByIdId 
} from "@/api/generated/role/role";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { parseApiData } from "@/utils/apiResponse";

const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  roleCode: z.string().min(1, "Role code is required"),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function CreateRoleScreen() {
  const { id } = useLocalSearchParams();
  const roleID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!roleID;

  const { userData } = useAuthStore();
  const { alert } = useDialog();
  const insertRole = usePostApiRoleInsertRole();
  const updateRole = usePutApiRoleUpdateRole();
  const { data: roleResponse, isLoading: loadingRole } = useGetApiRoleGetRoleByIdId(roleID as number, {
    query: { enabled: isEditing }
  });

  const { control, handleSubmit, reset } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleName: "",
      roleCode: "",
      description: "",
    },
  });

  useEffect(() => {
    if (roleResponse?.data) {
      const role = parseApiData(roleResponse.data) as any;
      reset({
        roleName: role.roleName || "",
        roleCode: role.roleCode || "",
        description: role.description || "",
      });
    }
  }, [roleResponse]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditing) {
        await updateRole.mutateAsync({ data: { ...data, roleID: roleID as number, updatedBy: parseInt(userData?.id || "0") } });
        await alert("Success", "Role updated successfully", "success");
      } else {
        await insertRole.mutateAsync({ data: { ...data, createdBy: parseInt(userData?.id || "0") } });
        await alert("Success", "Role created successfully", "success");
      }
      router.back();
    } catch (error: any) {
      await alert("Error", error.message || `Failed to ${isEditing ? "update" : "create"} role`, "error");
    }
  };

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Role" : "Create Role"}
      subtitle="Define system access levels"
      flatHeader
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
            label={isEditing ? "Save Changes" : "Create Role"}
            onPress={handleSubmit(onSubmit)}
            loading={isEditing ? updateRole.isPending : insertRole.isPending}
            className="mt-8"
          />
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}
