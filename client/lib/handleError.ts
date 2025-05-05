import { isAxiosError } from "axios";
import { toast } from "sonner";

interface getErrorMessageReturn {
  title: string;
  message: string;
}

export const getErrorMessage = (error: unknown): getErrorMessageReturn => {
  const defaultTitle = "Oops! Something went wrong 😬";
  const defaultMessage =
    "An error from server occurred, please contact support if the issue persists. 📩";

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
      message: defaultMessage,
    };
  }
  return {
    title: defaultTitle,
    message: defaultMessage,
  };
};

export const handleError = (
  error?: unknown,
  customError?: { title: string; message: string; type: "error" | "warning" },
): void => {
  if (
    isAxiosError(error) &&
    error.config?.headers?.["X-SUPPRESS-TOAST"] === "true"
  ) {
    return;
  }

  const toastId = customError
    ? "custom-error-toast-id"
    : "default-error-toast-id";

  if (customError) {
    if (customError.type === "error") {
      toast.error(customError.title, {
        description: customError.message,
        id: toastId,
      });
    } else {
      toast.warning(customError.title, {
        description: customError.message,
        id: toastId,
      });
    }

    return;
  }

  const { title, message } = getErrorMessage(error);

  toast.error(title, {
    description: message,
    id: toastId,
  });
};
