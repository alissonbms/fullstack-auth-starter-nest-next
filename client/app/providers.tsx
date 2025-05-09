"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/utils/error-boundary";
import { User } from "@/interfaces/user-interface";
import SessionRedirectHandler from "@/utils/SessionRedirectHandler";

interface ProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export const Providers = ({ children, initialUser }: ProviderProps) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        {children}
        <SessionRedirectHandler />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
