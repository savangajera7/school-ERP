/**
 * Teacher / staff attendance — generated Orval client (tag: 10. Teacher Attendance)
 */
export {
  // Roster + list (?view=teachers / ?view=list)
  getApiTeacherAttendanceGet,
  getGetApiTeacherAttendanceGetQueryKey,
  useGetApiTeacherAttendanceGet,
  // Bulk default-present mark / update / delete
  postApiTeacherAttendanceMark,
  usePostApiTeacherAttendanceMark,
  putApiTeacherAttendanceUpdate,
  usePutApiTeacherAttendanceUpdate,
  deleteApiTeacherAttendanceDeleteId,
  useDeleteApiTeacherAttendanceDeleteId,
  // Legacy single-insert (kept for compatibility)
  postApiTeacherAttendanceInsertOne,
  usePostApiTeacherAttendanceInsertOne,
  getApiTeacherAttendanceGetTeacherAttendanceList,
  useGetApiTeacherAttendanceGetTeacherAttendanceList,
} from "@/api/generated/10-teacher-attendance-admin-only/10-teacher-attendance-admin-only";
