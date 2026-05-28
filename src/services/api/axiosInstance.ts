import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "ApiKey": "d27c0d6f-obnk-9888-qucj-0953543d4733",
  },
});

// Request interceptor — attach Bearer token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor — handle 401
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);

// Custom mutator for Orval
export const customInstance = <T>(
  url: string,
  options: any
): Promise<T> => {
  const body = options.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  return axiosInstance({
    url,
    method: options.method,
    headers: isFormData
      ? { ...(options.headers || {}), "Content-Type": "multipart/form-data" }
      : options.headers,
    data: isFormData
      ? body
      : typeof body === "string"
        ? JSON.parse(body)
        : body,
  }).then((response: AxiosResponse<T>) => {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    } as any;
  });
};

export default axiosInstance;
