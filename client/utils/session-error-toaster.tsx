"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function SessionErrorToaster() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");

    if (!error) return;

    if (error === "expiredSession") {
      toast.warning("Session expired! 🔑", {
        description: "Please do login again to continue.",
        id: "toast-expired-session",
      });
    }

    if (error === "unauthenticated") {
      toast.error("Unauthorized access! 🔒", {
        description: "You must be logged in to access this page.",
        id: "toast-unauthorized-access",
      });
    }

    if (error === "alreadyLogged") {
      toast.info("You are already logged in! 😊", {
        description: "Redirected to our catalog.",
        id: "toast-already-logged",
      });
    }

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("error");
    router.replace(newUrl.toString(), { scroll: false });
  }, [searchParams, router]);

  return null;
}
