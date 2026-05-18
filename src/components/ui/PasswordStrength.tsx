import React from "react";
import { View, Text } from "react-native";

interface PasswordStrengthProps {
  password?: string;
  score?: number; // Optional manual score override
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password = "",
  score: manualScore,
}) => {
  const calculateStrength = (pass: string): number => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const score = manualScore !== undefined ? manualScore : calculateStrength(password);

  const getStrengthData = (s: number) => {
    switch (s) {
      case 1:
        return { label: "Weak", color: "#EF4444", filledCount: 1 };
      case 2:
        return { label: "Fair", color: "#F59E0B", filledCount: 2 };
      case 3:
        return { label: "Good", color: "#3B82F6", filledCount: 3 };
      case 4:
        return { label: "Strong", color: "#10B981", filledCount: 4 };
      default:
        return { label: "", color: "#E5E7EB", filledCount: 0 };
    }
  };

  const { label, color, filledCount } = getStrengthData(score);

  return (
    <View className="flex-row items-center justify-between w-full mt-2 mb-4">
      {/* 4 segments in a row */}
      <View className="flex-row gap-1 flex-1 mr-4">
        {[1, 2, 3, 4].map((index) => {
          const isFilled = index <= filledCount;
          return (
            <View
              key={index}
              style={{
                height: 4,
                borderRadius: 2,
                flex: 1,
                backgroundColor: isFilled ? color : "#E5E7EB",
              }}
            />
          );
        })}
      </View>

      {/* Label right of bars */}
      {label ? (
        <Text
          style={{ fontSize: 12, color, fontWeight: "600" }}
          className="text-right"
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
};
