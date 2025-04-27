import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email must not be empty.")
    .email("Invalid email format."),
});
