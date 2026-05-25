import type { Ionicons } from "@expo/vector-icons";

export type IoniconsName = keyof typeof Ionicons.glyphMap;

export type AppIconName =
  | "home"
  | "menu"
  | "search"
  | "settings"
  | "profile"
  | "logout"
  | "students"
  | "admission"
  | "attendance"
  | "attendanceReport"
  | "staffAttendance"
  | "fees"
  | "accounts"
  | "exams"
  | "subjects"
  | "teachers"
  | "parents"
  | "notices"
  | "compose"
  | "notifications"
  | "broadcast"
  | "leave"
  | "timetable"
  | "inquiries"
  | "reports"
  | "academic"
  | "masters"
  | "users"
  | "roles"
  | "results"
  | "homework"
  | "classwork"
  | "notebook"
  | "syllabus"
  | "money"
  | "chart"
  | "birthday"
  | "gift"
  | "flash"
  | "clock"
  | "check"
  | "warning"
  | "empty"
  | "email"
  | "lock"
  | "key"
  | "chevronRight"
  | "chevronBack"
  | "chevronDown"
  | "expand"
  | "collapse"
  | "superadmin"
  | "admin"
  | "teacher"
  | "parentRole"
  | "male"
  | "female"
  | "add"
  | "filter"
  | "calendar"
  | "school";

type IconPair = { outline: IoniconsName; filled: IoniconsName };

/** Outline + filled pairs for active/inactive states */
export const APP_ICONS: Record<AppIconName, IconPair> = {
  home: { outline: "home-outline", filled: "home" },
  menu: { outline: "grid-outline", filled: "grid" },
  search: { outline: "search-outline", filled: "search" },
  settings: { outline: "settings-outline", filled: "settings" },
  profile: { outline: "person-outline", filled: "person" },
  logout: { outline: "log-out-outline", filled: "log-out" },
  students: { outline: "school-outline", filled: "school" },
  admission: { outline: "document-text-outline", filled: "document-text" },
  attendance: { outline: "checkbox-outline", filled: "checkbox" },
  attendanceReport: { outline: "analytics-outline", filled: "analytics" },
  staffAttendance: { outline: "id-card-outline", filled: "id-card" },
  fees: { outline: "wallet-outline", filled: "wallet" },
  accounts: { outline: "receipt-outline", filled: "receipt" },
  exams: { outline: "bar-chart-outline", filled: "bar-chart" },
  subjects: { outline: "library-outline", filled: "library" },
  teachers: { outline: "people-outline", filled: "people" },
  parents: { outline: "heart-outline", filled: "heart" },
  notices: { outline: "megaphone-outline", filled: "megaphone" },
  compose: { outline: "create-outline", filled: "create" },
  notifications: { outline: "notifications-outline", filled: "notifications" },
  broadcast: { outline: "radio-outline", filled: "radio" },
  leave: { outline: "calendar-outline", filled: "calendar" },
  timetable: { outline: "time-outline", filled: "time" },
  inquiries: { outline: "chatbubbles-outline", filled: "chatbubbles" },
  reports: { outline: "trending-up-outline", filled: "trending-up" },
  academic: { outline: "business-outline", filled: "business" },
  masters: { outline: "construct-outline", filled: "construct" },
  users: { outline: "person-circle-outline", filled: "person-circle" },
  roles: { outline: "shield-outline", filled: "shield" },
  results: { outline: "trophy-outline", filled: "trophy" },
  homework: { outline: "book-outline", filled: "book" },
  classwork: { outline: "reader-outline", filled: "reader" },
  notebook: { outline: "journal-outline", filled: "journal" },
  syllabus: { outline: "list-outline", filled: "list" },
  money: { outline: "cash-outline", filled: "cash" },
  chart: { outline: "pie-chart-outline", filled: "pie-chart" },
  birthday: { outline: "gift-outline", filled: "gift" },
  gift: { outline: "gift-outline", filled: "gift" },
  flash: { outline: "flash-outline", filled: "flash" },
  clock: { outline: "timer-outline", filled: "timer" },
  check: { outline: "checkmark-circle-outline", filled: "checkmark-circle" },
  warning: { outline: "warning-outline", filled: "warning" },
  empty: { outline: "file-tray-outline", filled: "file-tray" },
  email: { outline: "mail-outline", filled: "mail" },
  lock: { outline: "lock-closed-outline", filled: "lock-closed" },
  key: { outline: "key-outline", filled: "key" },
  chevronRight: { outline: "chevron-forward", filled: "chevron-forward" },
  chevronBack: { outline: "chevron-back", filled: "chevron-back" },
  chevronDown: { outline: "chevron-down", filled: "chevron-down" },
  expand: { outline: "chevron-forward-outline", filled: "chevron-forward" },
  collapse: { outline: "chevron-back-outline", filled: "chevron-back" },
  superadmin: { outline: "diamond-outline", filled: "diamond" },
  admin: { outline: "shield-checkmark-outline", filled: "shield-checkmark" },
  teacher: { outline: "easel-outline", filled: "easel" },
  parentRole: { outline: "people-circle-outline", filled: "people-circle" },
  male: { outline: "male-outline", filled: "male" },
  female: { outline: "female-outline", filled: "female" },
  add: { outline: "add-circle-outline", filled: "add-circle" },
  filter: { outline: "funnel-outline", filled: "funnel" },
  calendar: { outline: "calendar-outline", filled: "calendar" },
  school: { outline: "school-outline", filled: "school" },
};

export function resolveIconName(
  name: AppIconName,
  active = false
): IoniconsName {
  const pair = APP_ICONS[name];
  return active ? pair.filled : pair.outline;
}

/** Quick-action tile colors (icon + background) */
export const QUICK_ACTION_STYLES: Record<
  AppIconName,
  { bg: string; iconBg: string; iconColor: string }
> = {
  students: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  attendance: { bg: "#FEF9C3", iconBg: "#FEF08A", iconColor: "#A16207" },
  fees: { bg: "#DCFCE7", iconBg: "#BBF7D0", iconColor: "#15803D" },
  exams: { bg: "#F3E8FF", iconBg: "#E9D5FF", iconColor: "#7E22CE" },
  teachers: { bg: "#FFE4E6", iconBg: "#FECDD3", iconColor: "#BE123C" },
  notices: { bg: "#FEF3C7", iconBg: "#FDE68A", iconColor: "#B45309" },
  academic: { bg: "#E0E7FF", iconBg: "#C7D2FE", iconColor: "#4338CA" },
  inquiries: { bg: "#CFFAFE", iconBg: "#A5F3FC", iconColor: "#0E7490" },
  results: { bg: "#FEF9C3", iconBg: "#FEF08A", iconColor: "#A16207" },
  timetable: { bg: "#FCE7F3", iconBg: "#FBCFE8", iconColor: "#BE185D" },
  reports: { bg: "#F0FDF4", iconBg: "#BBF7D0", iconColor: "#15803D" },
  admission: { bg: "#F5F3FF", iconBg: "#DDD6FE", iconColor: "#6D28D9" },
  leave: { bg: "#E0E7FF", iconBg: "#C7D2FE", iconColor: "#4338CA" },
  notifications: { bg: "#FEE2E2", iconBg: "#FECACA", iconColor: "#DC2626" },
  home: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  menu: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  search: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  settings: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  profile: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  logout: { bg: "#FEE2E2", iconBg: "#FECACA", iconColor: "#DC2626" },
  homework: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  classwork: { bg: "#F0FDF4", iconBg: "#BBF7D0", iconColor: "#15803D" },
  notebook: { bg: "#F5F3FF", iconBg: "#DDD6FE", iconColor: "#6D28D9" },
  syllabus: { bg: "#FFF7ED", iconBg: "#FFEDD5", iconColor: "#C2410C" },
  parents: { bg: "#FCE7F3", iconBg: "#FBCFE8", iconColor: "#BE185D" },
  masters: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  subjects: { bg: "#ECFDF5", iconBg: "#A7F3D0", iconColor: "#047857" },
  accounts: { bg: "#F0F9FF", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  money: { bg: "#F0F9FF", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  compose: { bg: "#FEF3C7", iconBg: "#FDE68A", iconColor: "#B45309" },
  broadcast: { bg: "#FEE2E2", iconBg: "#FECACA", iconColor: "#DC2626" },
  staffAttendance: { bg: "#CFFAFE", iconBg: "#A5F3FC", iconColor: "#0E7490" },
  attendanceReport: { bg: "#F0FDF4", iconBg: "#BBF7D0", iconColor: "#15803D" },
  users: { bg: "#E0E7FF", iconBg: "#C7D2FE", iconColor: "#4338CA" },
  roles: { bg: "#F5F3FF", iconBg: "#DDD6FE", iconColor: "#6D28D9" },
  chart: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  birthday: { bg: "#FCE7F3", iconBg: "#FBCFE8", iconColor: "#BE185D" },
  gift: { bg: "#FCE7F3", iconBg: "#FBCFE8", iconColor: "#BE185D" },
  flash: { bg: "#FEF9C3", iconBg: "#FEF08A", iconColor: "#A16207" },
  clock: { bg: "#CFFAFE", iconBg: "#A5F3FC", iconColor: "#0E7490" },
  check: { bg: "#DCFCE7", iconBg: "#BBF7D0", iconColor: "#15803D" },
  warning: { bg: "#FEF3C7", iconBg: "#FDE68A", iconColor: "#B45309" },
  empty: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#6B7280" },
  email: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  lock: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  key: { bg: "#FEF3C7", iconBg: "#FDE68A", iconColor: "#B45309" },
  chevronRight: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#9CA3AF" },
  chevronBack: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#9CA3AF" },
  chevronDown: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#9CA3AF" },
  expand: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#9CA3AF" },
  collapse: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#9CA3AF" },
  superadmin: { bg: "#F5F3FF", iconBg: "#DDD6FE", iconColor: "#6D28D9" },
  admin: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
  teacher: { bg: "#CCFBF1", iconBg: "#99F6E4", iconColor: "#0F766E" },
  parentRole: { bg: "#F3E8FF", iconBg: "#E9D5FF", iconColor: "#7E22CE" },
  male: { bg: "#DBEAFE", iconBg: "#BFDBFE", iconColor: "#1D4ED8" },
  female: { bg: "#FCE7F3", iconBg: "#FBCFE8", iconColor: "#BE185D" },
  add: { bg: "#DCFCE7", iconBg: "#BBF7D0", iconColor: "#15803D" },
  filter: { bg: "#F3F4F6", iconBg: "#E5E7EB", iconColor: "#374151" },
  calendar: { bg: "#E0E7FF", iconBg: "#C7D2FE", iconColor: "#4338CA" },
  school: { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1" },
};
