import { User } from "@/interfaces/user-interface";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
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
      const res = await api.get("/auth/session");
      return res.data;
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
