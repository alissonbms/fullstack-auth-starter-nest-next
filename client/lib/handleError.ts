import { isAxiosError } from "axios";
import { toast } from "sonner";

interface getErrorMessageReturn {
  title: string;
  message: string;
}

export const getErrorMessage = (error: unknown): getErrorMessageReturn => {
  const defaultTitle = "Oops! Something went wrong 😬";
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    const message = responseData.message;

    if (responseData && message) {
      if (error.response?.status === 401) {
        return {
          title: "Your session has expired! 🔐",
          message: "Please do login again to continue.",
        };
      }

      return {
        title: defaultTitle,
        message: Array.isArray(message) ? message.join(", ") : `${message}`,
      };
    }

    return {
      title: defaultTitle,
      message:
        "Unknown error from server, please contact support if the issue persists. 📩",
    };
  }
  return {
    title: defaultTitle,
    message:
      "An error occurred, please contact support if the issue persists. 📩",
  };
};

export const handleError = (error: unknown): void => {
  if (
    isAxiosError(error) &&
    error.config?.headers?.["X-SUPPRESS-TOAST"] === "true"
  ) {
    return;
  }

  const { title, message } = getErrorMessage(error);

  toast.error(title, {
    description: message,
  });
};
