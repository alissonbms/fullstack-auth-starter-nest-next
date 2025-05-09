import { User } from "@/interfaces/user-interface";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";

interface useSessionCheckerProps {
  initialUser?: User | null;
}
export const useSessionChecker = ({
  initialUser = null,
}: useSessionCheckerProps) => {
  const [enabled] = useState(!initialUser);

  const { data, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/session");
        return res.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const isSessionCheck = error.config?.url?.includes("/auth/session");

          if (!isSessionCheck) {
            handleError(error);
          }

          return null;
        }
      }
    },
    initialData: initialUser,
    retry: 0,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
    enabled,
  });

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    refetchSession: refetch,
  };
};
