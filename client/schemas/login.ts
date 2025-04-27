import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email must not be empty.")
    .email("Invalid email format."),
  password: z.string().trim().min(1, "Password must not be empty."),
});
