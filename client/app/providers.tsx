"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { Toaster } from "sonner";
import "./globals.css";

interface ProviderProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProviderProps) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster position="bottom-center" />
  </QueryClientProvider>
);
