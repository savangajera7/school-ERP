import axiosInstance from "@/services/api/axiosInstance";
import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResult } from "@/types/auth.types";

export interface AcademicYear {
  academicYearID: number;
  academicYearName: string;
  startDate: string;
  endDate: string;
}

export interface ClassDetail {
  classID: number;
  className: string;
}

export interface SectionDetail {
  sectionID: number;
  sectionName: string;
}

export interface BatchDetail {
  batchID: number;
  batchName: string;
}

export const setupService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const response = await axiosInstance.get<ApiResult<AcademicYear[]>>(
      API_ENDPOINTS.ACADEMIC_YEARS
    );
    return response.data.success ? response.data.data || [] : [];
  },

  getClasses: async (): Promise<ClassDetail[]> => {
    const response = await axiosInstance.get<ApiResult<ClassDetail[]>>(
      API_ENDPOINTS.CLASSES
    );
    return response.data.success ? response.data.data || [] : [];
  },

  getSections: async (): Promise<SectionDetail[]> => {
    const response = await axiosInstance.get<ApiResult<SectionDetail[]>>(
      API_ENDPOINTS.SECTIONS
    );
    return response.data.success ? response.data.data || [] : [];
  },

  getBatches: async (): Promise<BatchDetail[]> => {
    const response = await axiosInstance.get<ApiResult<BatchDetail[]>>(
      API_ENDPOINTS.BATCHES
    );
    return response.data.success ? response.data.data || [] : [];
  },
};
