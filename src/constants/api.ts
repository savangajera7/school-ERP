export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://schoolmanagement.mahispark.com";

export const API_ENDPOINTS = {
  LOGIN: "/Login/Login",
  ACADEMIC_YEARS: "/AcademicYear/GetAll",
  STUDENTS: "/Student/GetAllStudents",
  STUDENT_BY_ID: "/Student/GetStudentByID",
  CLASSES: "/Class/GetAll",
  SECTIONS: "/Section/GetAll",
  BATCHES: "/Batch/GetAll",
} as const;

export const API_TIMEOUT = 15000;
