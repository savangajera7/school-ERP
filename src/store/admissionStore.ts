// AUDIT FIX #7
import { create } from 'zustand';

interface AdmissionState {
  formData: any;
  currentStep: number;
  setFormData: (data: any) => void;
  updateFormData: (data: Partial<any>) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

export const useAdmissionStore = create<AdmissionState>((set) => ({
  formData: {},
  currentStep: 1,
  setFormData: (data) => set({ formData: data }),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  setCurrentStep: (step) => set({ currentStep: step }),
  resetForm: () => set({ formData: {}, currentStep: 1 }),
}));
