import { User } from "@/interfaces/user-interface";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useSessionChecker = () => {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await api.get("/auth/session");
      return res.data;
    },
    retry: 0,
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    enableSessionCheck: () => setEnabled(true),
    disableSessionCheck: () => setEnabled(false),
    refetchSession: refetch,
  };
};
