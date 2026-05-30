import { SchoolTheme } from "@/constants/theme";
/**
 * PremiumDatePicker — fully custom cross-platform date picker.
 * Works identically on Web, iOS, and Android.
 * No OS-native picker used — renders a custom modal calendar.
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors } from "@/constants/colors";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { formatDisplayDate } from "@/utils/dateHelpers";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PremiumDatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYMD(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PremiumDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select Date",
  minimumDate,
  maximumDate,
}: PremiumDatePickerProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => parseYMD(value), [value]);
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(() => selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate?.getMonth() ?? today.getMonth());
  const [mode, setMode] = useState<"calendar" | "month" | "year">("calendar");

  const openPicker = useCallback(() => {
    const d = parseYMD(value);
    setViewYear(d?.getFullYear() ?? today.getFullYear());
    setViewMonth(d?.getMonth() ?? today.getMonth());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMode("calendar");
    setOpen(true);
  }, [value, today]);

  const selectDay = useCallback(
    (day: number) => {
      const date = new Date(viewYear, viewMonth, day);
      if (minimumDate && date < minimumDate) return;
      if (maximumDate && date > maximumDate) return;
      onChange(toYMD(date));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setOpen(false);
    },
    [viewYear, viewMonth, minimumDate, maximumDate, onChange]
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(viewYear, viewMonth);
    const startDay = firstDayOfMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const isDayDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minimumDate && d < minimumDate) return true;
    if (maximumDate && d > maximumDate) return true;
    return false;
  };

  const isDaySelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isDayToday = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  // Year range for year picker
  const yearRange = useMemo(() => {
    const base = viewYear;
    const years: number[] = [];
    for (let y = base - 100; y <= base + 20; y++) years.push(y);
    return years;
  }, [viewYear]);



  // ── Native: custom modal calendar ────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      {/* Trigger button */}
      <TouchableOpacity
        onPress={openPicker}
        activeOpacity={0.7}
        style={[
          styles.trigger, 
          isDark && { 
            backgroundColor: SchoolTheme.cardDark, 
            borderColor: SchoolTheme.borderDark 
          }
        ]}
      >
        <Text style={[
          styles.triggerText, 
          !value && styles.triggerPlaceholder,
          isDark && { color: SchoolTheme.textDark },
          isDark && !value && { color: "#64748B" }
        ]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Text style={styles.calIcon}>📅</Text>
      </TouchableOpacity>

      {/* Modal calendar */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.calCard, 
              premiumCardShadow as any,
              isDark && { 
                backgroundColor: SchoolTheme.cardDark, 
                borderColor: SchoolTheme.borderDark 
              },
              !isDark && {
                backgroundColor: "#fff",
                borderColor: "#F3F4F6",
              }
            ]}
            onPress={() => {}}
          >
            {/* ── Calendar mode ── */}
            {mode === "calendar" && (
              <>
                {/* Header */}
                <View style={styles.calHeader}>
                  <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, isDark ? { backgroundColor: "#334155" } : { backgroundColor: "#F3F4F6" }]}>
                    <Text style={[styles.navArrow, isDark && { color: SchoolTheme.primaryLight }]}>‹</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode("month"); }}
                    style={styles.monthYearBtn}
                  >
                    <Text style={[styles.monthYearText, isDark && { color: SchoolTheme.primaryLight }]}>
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, isDark ? { backgroundColor: "#334155" } : { backgroundColor: "#F3F4F6" }]}>
                    <Text style={[styles.navArrow, isDark && { color: SchoolTheme.primaryLight }]}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Day names */}
                <View style={styles.dayNamesRow}>
                  {DAY_NAMES.map((d) => (
                    <Text key={d} style={[styles.dayName, isDark && { color: "#94A3B8" }]}>{d}</Text>
                  ))}
                </View>

                {/* Days grid */}
                <View style={styles.daysGrid}>
                  {calendarDays.map((day, i) => {
                    if (!day) return <View key={`e-${i}`} style={styles.dayCell} />;
                    const selected = isDaySelected(day);
                    const isToday = isDayToday(day);
                    const disabled = isDayDisabled(day);
                    return (
                      <TouchableOpacity
                        key={`d-${day}`}
                        onPress={() => !disabled && selectDay(day)}
                        style={[
                          styles.dayCell,
                          selected && styles.dayCellSelected,
                          isToday && !selected && (isDark 
                            ? { backgroundColor: "rgba(13,54,102,0.3)", borderWidth: 1, borderColor: SchoolTheme.primaryLight }
                            : styles.dayCellToday
                          ),
                          disabled && styles.dayCellDisabled,
                        ]}
                        activeOpacity={disabled ? 1 : 0.7}
                      >
                        <Text
                          style={[
                            styles.dayText, 
                            isDark && { color: SchoolTheme.textDark },
                            selected && styles.dayTextSelected,
                            isToday && !selected && styles.dayTextToday,
                            disabled && styles.dayTextDisabled,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Today shortcut */}
                <TouchableOpacity
                  onPress={() => {
                    const t = new Date();
                    setViewYear(t.getFullYear());
                    setViewMonth(t.getMonth());
                    selectDay(t.getDate());
                  }}
                  style={[
                    styles.todayBtn, 
                    isDark 
                      ? { backgroundColor: "rgba(13,54,102,0.5)", borderColor: SchoolTheme.primaryLight }
                      : { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }
                  ]}
                >
                  <Text style={[styles.todayBtnText, isDark && { color: SchoolTheme.primaryLight }]}>Today</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Month picker mode ── */}
            {mode === "month" && (
              <>
                <View style={styles.calHeader}>
                  <TouchableOpacity
                    onPress={() => setMode("year")}
                    style={styles.monthYearBtn}
                  >
                    <Text style={[styles.monthYearText, isDark && { color: SchoolTheme.primaryLight }]}>{viewYear}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode("calendar"); }}
                    style={[styles.navBtn, isDark ? { backgroundColor: "#334155" } : { backgroundColor: "#F3F4F6" }]}
                  >
                    <Text style={[styles.navArrow, isDark && { color: SchoolTheme.primaryLight }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.monthGrid}>
                  {MONTH_NAMES.map((name, idx) => (
                    <TouchableOpacity
                      key={name}
                      onPress={() => { setViewMonth(idx); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMode("calendar"); }}
                      style={[
                        styles.monthCell,
                        viewMonth === idx && styles.monthCellSelected,
                        isDark && viewMonth !== idx && { backgroundColor: "#1E293B", borderColor: "#334155" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          viewMonth === idx && styles.monthCellTextSelected,
                          isDark && viewMonth !== idx && { color: SchoolTheme.textDark },
                        ]}
                      >
                        {name.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* ── Year picker mode ── */}
            {mode === "year" && (
              <>
                <View style={styles.calHeader}>
                  <Text style={[styles.monthYearText, isDark && { color: SchoolTheme.primaryLight }]}>Select Year</Text>
                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode("calendar"); }}
                    style={[styles.navBtn, isDark ? { backgroundColor: "#334155" } : { backgroundColor: "#F3F4F6" }]}
                  >
                    <Text style={[styles.navArrow, isDark && { color: SchoolTheme.primaryLight }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={styles.yearGrid} showsVerticalScrollIndicator={false}>
                  {yearRange.map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => { setViewYear(y); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMode("month"); }}
                      style={[
                        styles.yearCell,
                        viewYear === y && styles.yearCellSelected,
                        isDark && viewYear !== y && { backgroundColor: "#1E293B", borderColor: "#334155" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.yearCellText,
                          viewYear === y && styles.yearCellTextSelected,
                          isDark && viewYear !== y && { color: SchoolTheme.textDark },
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trigger: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  triggerPlaceholder: { color: "#9CA3AF" },
  calIcon: { fontSize: 16 },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  calCard: {
    borderRadius: 20,
    padding: 16,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
  },

  // Calendar header
  calHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrow: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    lineHeight: 24,
  },
  monthYearBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
  },

  // Day names row
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },

  // Days grid
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 1,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayCellToday: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "800",
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: "800",
  },
  dayTextDisabled: {
    color: "#D1D5DB",
  },

  // Today button
  todayBtn: {
    marginTop: 10,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },

  // Month grid
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 4,
  },
  monthCell: {
    width: "30%",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 2,
  },
  monthCellSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthCellText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  monthCellTextSelected: {
    color: "#fff",
  },

  // Year grid
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 4,
    maxHeight: 260,
  },
  yearCell: {
    width: "22%",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 2,
  },
  yearCellSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearCellText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  yearCellTextSelected: {
    color: "#fff",
  },
});
