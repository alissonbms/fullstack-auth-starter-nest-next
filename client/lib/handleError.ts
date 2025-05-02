import { isAxiosError } from "axios";
import { toast } from "sonner";

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    const message = responseData.message;

    return Array.isArray(message) ? message.join(", ") : `${message}`;
  }

  return "An error occurred, please contact support if the issue persists. 📩";
};

export const handleError = (error: unknown): void => {
  if (
    isAxiosError(error) &&
    error.config?.headers?.["X-SUPPRESS-TOAST"] === "true"
  ) {
    return;
  }
  const message = getErrorMessage(error);

  toast.error("Oops! Something went wrong 😬", {
    description: message,
  });
};
