import axios from "axios";
import { handleError } from "./handleError";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url?.includes("/auth/session");

    if (!isSessionCheck) {
      handleError(error);
    }

    return Promise.reject(error);
  },
);
