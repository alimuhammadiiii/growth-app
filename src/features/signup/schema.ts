import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Use letters, numbers, dots and underscores only",
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupValues = z.infer<typeof signupSchema>;
