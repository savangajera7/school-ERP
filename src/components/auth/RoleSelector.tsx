import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { Role } from "@/types/auth.types";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon } from "@/components/icons/AppIcon";
import { SchoolTheme } from "@/constants/theme";

interface RoleSelectorProps {
  selected: Role;
  onChange: (role: Role) => void;
}

const ROLES: { value: Role; label: string; icon: AppIconName }[] = [
  { value: "super_admin", label: "Super Admin", icon: "superadmin" },
  { value: "admin", label: "Admin", icon: "admin" },
  { value: "teacher", label: "Teacher", icon: "teacher" },
  { value: "parent", label: "Parent", icon: "parentRole" },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selected, onChange }) => {
  return (
    <View className="flex-row bg-[#F3F4F6] rounded-xl p-[4px] w-full mb-6">
      {ROLES.map((role) => {
        const isActive = selected === role.value;
        return (
          <TouchableOpacity
            key={role.value}
            onPress={() => onChange(role.value)}
            activeOpacity={0.8}
            className={`
              flex-1 min-h-[44px] rounded-[10px] items-center justify-center flex-row gap-1.5
              ${isActive ? "bg-white" : "bg-transparent"}
            `}
            style={
              isActive
                ? {
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }
                : undefined
            }
          >
            <AppIcon
              name={role.icon}
              size={18}
              color={isActive ? SchoolTheme.primary : "#9CA3AF"}
              active={isActive}
            />
            <Text
              className={`
                text-[14px] font-bold
                ${isActive ? "text-[#0d3666]" : "text-[#9CA3AF]"}
              `}
            >
              {role.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
