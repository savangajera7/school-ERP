import axiosInstance from "@/services/api/axiosInstance";
import type { ApiResult } from "@/types/auth.types";

export interface SubjectMark {
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

export interface StudentResult {
  examName: string;
  examDate: string;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail";
  subjects: SubjectMark[];
}

export const resultService = {
  // This is a mock implementation as the API is not yet available in Swagger
  getResultsByStudentId: async (studentId: number): Promise<StudentResult[]> => {
    // Simulate API call
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    
    return [
      {
        examName: "Unit Test I",
        examDate: "2026-05-10",
        totalMarks: 400,
        percentage: 85.5,
        grade: "A",
        status: "Pass",
        subjects: [
          { subjectName: "Mathematics", marksObtained: 92, totalMarks: 100, grade: "A+" },
          { subjectName: "Science", marksObtained: 85, totalMarks: 100, grade: "A" },
          { subjectName: "English", marksObtained: 78, totalMarks: 100, grade: "B+" },
          { subjectName: "History", marksObtained: 90, totalMarks: 100, grade: "A+" },
        ]
      },
      {
        examName: "First Term Examination",
        examDate: "2026-03-15",
        totalMarks: 600,
        percentage: 78.2,
        grade: "B",
        status: "Pass",
        subjects: [
          { subjectName: "Mathematics", marksObtained: 88, totalMarks: 100, grade: "A" },
          { subjectName: "Science", marksObtained: 72, totalMarks: 100, grade: "B" },
          { subjectName: "English", marksObtained: 80, totalMarks: 100, grade: "A" },
          { subjectName: "History", marksObtained: 75, totalMarks: 100, grade: "B" },
          { subjectName: "Geography", marksObtained: 82, totalMarks: 100, grade: "A" },
          { subjectName: "Computer Science", marksObtained: 95, totalMarks: 100, grade: "A+" },
        ]
      }
    ];
  }
};
