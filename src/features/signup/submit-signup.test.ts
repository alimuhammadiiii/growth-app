import { describe, expect, it, vi } from "vitest";

import {
  EMAIL_TAKEN_MESSAGE,
  SIGNUP_FAILED_MESSAGE,
  USERNAME_TAKEN_MESSAGE,
} from "./constants";
import type { SignupValues } from "./schema";
import { submitSignup } from "./submit-signup";

const values: SignupValues = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  username: "ada",
  password: "correct-horse",
};

function makeDeps(error?: { code?: string } | null) {
  return {
    signUpEmail: vi.fn(async () => ({ error: error ?? null })),
  };
}

describe("submitSignup", () => {
  it("succeeds and passes the detected timezone", async () => {
    const deps = makeDeps(null);

    const result = await submitSignup(values, "Europe/Rome", deps);

    expect(result).toEqual({ ok: true });
    expect(deps.signUpEmail).toHaveBeenCalledWith({
      ...values,
      timezone: "Europe/Rome",
    });
  });

  it("falls back to UTC when no timezone is detected", async () => {
    const deps = makeDeps(null);

    await submitSignup(values, null, deps);

    expect(deps.signUpEmail).toHaveBeenCalledWith({
      ...values,
      timezone: "UTC",
    });
  });

  it("maps USER_ALREADY_EXISTS to the email field", async () => {
    const result = await submitSignup(
      values,
      "UTC",
      makeDeps({ code: "USER_ALREADY_EXISTS" }),
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { email: EMAIL_TAKEN_MESSAGE },
    });
  });

  it("maps USERNAME_IS_ALREADY_TAKEN to the username field", async () => {
    const result = await submitSignup(
      values,
      "UTC",
      makeDeps({ code: "USERNAME_IS_ALREADY_TAKEN" }),
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { username: USERNAME_TAKEN_MESSAGE },
    });
  });

  it("maps an unknown error code to a form-level error", async () => {
    const result = await submitSignup(
      values,
      "UTC",
      makeDeps({ code: "RATE_LIMITED" }),
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { form: SIGNUP_FAILED_MESSAGE },
    });
  });

  it("maps a missing error code to a form-level error", async () => {
    const result = await submitSignup(values, "UTC", makeDeps({}));

    expect(result).toEqual({
      ok: false,
      fieldErrors: { form: SIGNUP_FAILED_MESSAGE },
    });
  });
});
