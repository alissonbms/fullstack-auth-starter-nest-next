import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/handleError";
type UseApiMutationProps<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: AxiosError) => void;
  setFormError?: (message: string) => void;
};

export function useApiMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  onSuccess,
  onError,
  setFormError,
}: UseApiMutationProps<TData, TVariables>) {
  return useMutation({
    mutationFn,
    onSuccess,
    onError: (error: AxiosError) => {
      const message = getErrorMessage(error);

      if (setFormError) {
        return setFormError(
          message ||
            "An error occurred. Please contact support if the issue persists.",
        );
      }
      onError?.(error);
    },
  });
}
