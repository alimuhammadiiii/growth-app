import {
  EMAIL_TAKEN_MESSAGE,
  SIGNUP_FAILED_MESSAGE,
  USERNAME_TAKEN_MESSAGE,
} from "./constants";
import type { SignupValues } from "./schema";
import type { SignUpFieldErrors } from "./types";

type SignUpEmailInput = {
  name: string;
  email: string;
  username: string;
  password: string;
  timezone: string;
};

export type SubmitSignupDeps = {
  signUpEmail: (
    input: SignUpEmailInput,
  ) => Promise<{ error?: { code?: string } | null }>;
};

export type SignupSubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors: SignUpFieldErrors };

function mapSignUpError(code: string | undefined): SignUpFieldErrors {
  switch (code) {
    case "USER_ALREADY_EXISTS":
      return { email: EMAIL_TAKEN_MESSAGE };
    case "USERNAME_IS_ALREADY_TAKEN":
      return { username: USERNAME_TAKEN_MESSAGE };
    default:
      return { form: SIGNUP_FAILED_MESSAGE };
  }
}

export async function submitSignup(
  values: SignupValues,
  timezone: string | null,
  deps: SubmitSignupDeps,
): Promise<SignupSubmitResult> {
  const result = await deps.signUpEmail({
    name: values.name,
    email: values.email,
    username: values.username,
    password: values.password,
    timezone: timezone ?? "UTC",
  });

  if (result.error) {
    return { ok: false, fieldErrors: mapSignUpError(result.error.code) };
  }

  return { ok: true };
}
