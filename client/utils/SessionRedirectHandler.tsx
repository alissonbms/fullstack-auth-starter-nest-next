"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const SessionRedirectHandler = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(true);

  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false;
    }

    if (!isLoading && !isAuthenticated && hasRedirected.current === false) {
      hasRedirected.current = true;

      toast.info("Logout successful!", {
        description: "You have been redirected to login.",
        duration: 1500,
        id: "toast-logout",
      });

      const timeout = setTimeout(() => {
        router.push("/login");
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, isAuthenticated, router]);

  return null;
};

export default SessionRedirectHandler;
