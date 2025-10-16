// src/api.ts
import axios, { AxiosInstance } from "axios";

// Safely get the API base URL from environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn(
    "[Warning] VITE_API_BASE_URL is not defined in your environment. Using fallback: http://localhost:8000"
  );
}

// Create the Axios instance
const api: AxiosInstance = axios.create({
  baseURL: baseURL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // optional safety timeout
  withCredentials: false, // adjust to true if you need cookies
});

export default api;
