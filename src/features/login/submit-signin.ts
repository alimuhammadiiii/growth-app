import { INVALID_CREDENTIALS_MESSAGE } from "./constants";
import type { LoginValues } from "./schema";

type AuthCallResult = { error?: { code?: string } | null };

export type SubmitSigninDeps = {
  signInEmail: (input: {
    email: string;
    password: string;
  }) => Promise<AuthCallResult>;
  signInUsername: (input: {
    username: string;
    password: string;
  }) => Promise<AuthCallResult>;
};

export type SigninSubmitResult = { ok: true } | { ok: false; message: string };

export async function submitSignin(
  values: LoginValues,
  deps: SubmitSigninDeps,
): Promise<SigninSubmitResult> {
  const result = values.identifier.includes("@")
    ? await deps.signInEmail({
        email: values.identifier,
        password: values.password,
      })
    : await deps.signInUsername({
        username: values.identifier,
        password: values.password,
      });

  if (result.error) {
    return { ok: false, message: INVALID_CREDENTIALS_MESSAGE };
  }

  return { ok: true };
}
