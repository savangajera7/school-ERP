import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import type { Role } from "@/types/auth.types";

interface RoleSelectorProps {
  selected: Role;
  onChange: (role: Role) => void;
}

const ROLES: { value: Role; label: string; icon: string }[] = [
  { value: "superadmin", label: "Super Admin", icon: "👑" },
  { value: "admin", label: "Admin", icon: "🛡️" },
  { value: "teacher", label: "Teacher", icon: "📖" },
  { value: "parent", label: "Parent", icon: "👥" },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selected,
  onChange,
}) => {
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
              flex-1 h-10 rounded-[10px] items-center justify-center flex-row
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
            <Text className="text-[16px] mr-1.5">{role.icon}</Text>
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
