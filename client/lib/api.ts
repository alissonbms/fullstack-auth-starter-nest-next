import axios from "axios";
import { handleError } from "./handleError";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleError(error);

    return Promise.reject(error);
  },
);
