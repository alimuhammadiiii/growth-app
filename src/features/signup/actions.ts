"use server";

import { emailExists, usernameExists } from "@/db/repositories/users";

import { signupSchema } from "./schema";

/**
 * Returns whether the email is available, or null when the input is invalid
 * (the UI stays silent instead of showing a wrong check result).
 */
export async function checkEmailAvailability(
  email: string,
): Promise<boolean | null> {
  const parsed = signupSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return null;
  }

  return !(await emailExists(parsed.data.toLowerCase()));
}

/**
 * Returns whether the username is available, or null when the input is invalid
 * (the UI stays silent instead of showing a wrong check result).
 */
export async function checkUsernameAvailability(
  username: string,
): Promise<boolean | null> {
  const parsed = signupSchema.shape.username.safeParse(username);
  if (!parsed.success) {
    return null;
  }

  return !(await usernameExists(parsed.data.toLowerCase()));
}
