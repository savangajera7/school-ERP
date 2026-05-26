import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { AppIcon } from "@/components/icons/AppIcon";
import { Colors } from "@/constants/colors";
import { formatDisplayDate } from "@/utils/dateHelpers";

interface PremiumDatePickerProps {
  label: string;
  value: string; // Internal standard YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function PremiumDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select Date",
  minimumDate,
  maximumDate,
}: PremiumDatePickerProps) {
  const [show, setShow] = useState(false);

  // Convert string YYYY-MM-DD to Date object
  const getDateObject = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Convert Date object to string YYYY-MM-DD (Internal API standard)
  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (selectedDate) {
      onChange(formatApiDate(selectedDate));
    }
  };

  const togglePicker = () => {
    setShow(!show);
  };

  const renderPicker = () => {
    if (Platform.OS === "web") {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            height: 48,
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: "0 16px",
            fontSize: 14,
            fontWeight: "600",
            color: "#1F2937",
            width: "100%",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      );
    }

    return (
      <View>
        <TouchableOpacity
          onPress={togglePicker}
          activeOpacity={0.7}
          className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 flex-row items-center justify-between"
        >
          <Text
            className={`text-sm font-semibold ${
              value ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </Text>
          <AppIcon name="timetable" size={18} color={Colors.primary} />
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            value={getDateObject(value)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )}
      </View>
    );
  };

  return (
    <View className="mb-4">
      <Text style={styles.label}>{label}</Text>
      {renderPicker()}
    </View>
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
