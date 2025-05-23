import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(1, "Password must not be empty.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
        "Password must be at least 8 characters long, including numbers, upper and lower case letters, and symbols.",
      ),
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Password confirmation must not be empty."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
