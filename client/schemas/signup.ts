import { z } from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username must not be empty.")
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be a maximum of 20 characters long."),
  email: z
    .string()
    .trim()
    .min(1, "Email must not be empty.")
    .email("Invalid email format."),
  password: z
    .string()
    .trim()
    .min(1, "Password must not be empty.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Password must be at least 8 characters long, including numbers, upper and lower case letters, and symbols.",
    ),
});
