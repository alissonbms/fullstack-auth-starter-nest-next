import { z } from "zod";

export const SignUpSchema = z
  .object({
    profileImage: z
      .instanceof(File)
      .refine((file) => file instanceof File, "Invalid image file")
      .refine((file) => file instanceof Blob, "Invalid image file")
      .refine((file) => file.size <= 2 * 1024 * 1024, {
        message: "Image must be no larger than 2MB",
      })
      .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
        message: "Only JPEG or PNG images are allowed.",
      })
      .optional(),
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
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Password confirmation must not be empty."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
