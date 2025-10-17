// src/api.ts
import axios, { AxiosInstance, AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_API_BASE_URL || (window.location.origin + "/api");

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

// Attach auth token from localStorage (key: access_token or token)
// Use InternalAxiosRequestConfig for correct interceptor typing and ensure headers exist
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (token) {
        // Ensure headers object exists and is a plain object the library accepts
        if (!config.headers) {
          // Axios expects AxiosRequestHeaders; assign a plain object and cast
          config.headers = {} as any;
        }
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: basic global error handling & logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";

    console.error("API error:", error);
    if (error?.response?.status !== 401) {
      try {
        toast.error(String(message));
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
