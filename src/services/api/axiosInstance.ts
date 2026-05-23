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
    if (error.response?.status === 401) {
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
  return axiosInstance({
    url,
    ...options,
    data: options.body ? JSON.parse(options.body) : undefined,
  }).then((response: AxiosResponse<T>) => response.data);
};

export default axiosInstance;
