import axiosInstance from "@/services/api/axiosInstance";
import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResult } from "@/types/auth.types";
import { StudentModel } from "@/api/model/studentModel";

export const studentService = {
  getAllStudents: async (): Promise<StudentModel[]> => {
    const response = await axiosInstance.get<ApiResult<StudentModel[]>>(
      API_ENDPOINTS.STUDENTS
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  getStudentById: async (id: number): Promise<StudentModel | null> => {
    const response = await axiosInstance.post<ApiResult<StudentModel>>(
      API_ENDPOINTS.STUDENT_BY_ID,
      { studentID: id }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  },
};
