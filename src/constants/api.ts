export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://schoolmanagement.mahispark.com";

export const API_ENDPOINTS = {
  LOGIN: "/api/Login/Login",
  ACADEMIC_YEARS: "/api/AcademicYear/GetAll",
  STUDENTS: "/api/Student/GetAllStudents",
  STUDENT_BY_ID: "/api/Student/GetStudentByID",
  CLASSES: "/api/Class/GetAll",
  SECTIONS: "/api/Section/GetAll",
  BATCHES: "/api/Batch/GetAll",
} as const;

export const API_TIMEOUT = 15000;
