import React, { useRef, useState } from "react";
import { View, TextInput, type NativeSyntheticEvent, type TextInputKeyPressEventData } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
}) => {
  const { width } = useResponsive();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    const newOtp = newDigits.join("");
    onChange(newOtp);

    // Auto-focus next
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.length === length && !newOtp.includes("")) {
      onComplete?.(newOtp);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      onChange(newDigits.join(""));
    }
  };

  const boxWidth = width < 360 ? 44 : width >= 600 ? 52 : 48;

  return (
    <View className="flex-row justify-center gap-[10px] my-6">
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        const isFilled = digit.length > 0;

        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            style={{
              width: boxWidth,
              height: 56,
              fontSize: 22,
              textAlign: "center",
            }}
            className={`
              rounded-xl border-[1.5px] font-bold text-center text-[#111827]
              ${
                error
                  ? "border-red-500 bg-[#FFF5F5]"
                  : isFocused
                  ? "border-blue-500 bg-white"
                  : isFilled
                  ? "border-[#f5921e] bg-emerald-50"
                  : "border-gray-200 bg-[#F9FAFB]"
              }
            `}
          />
        );
      })}
    </View>
  );
};
