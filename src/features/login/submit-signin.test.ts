import { describe, expect, it, vi } from "vitest";

import { INVALID_CREDENTIALS_MESSAGE } from "./constants";
import type { LoginValues } from "./schema";
import { submitSignin } from "./submit-signin";

const emailValues: LoginValues = {
  identifier: "ada@example.com",
  password: "correct-horse",
};

const usernameValues: LoginValues = {
  identifier: "ada",
  password: "correct-horse",
};

function makeDeps(opts: { emailError?: boolean; usernameError?: boolean } = {}) {
  return {
    signInEmail: vi.fn(async () => ({
      error: opts.emailError ? { code: "INVALID_EMAIL_OR_PASSWORD" } : null,
    })),
    signInUsername: vi.fn(async () => ({
      error: opts.usernameError ? { code: "INVALID_USERNAME_OR_PASSWORD" } : null,
    })),
  };
}

describe("submitSignin", () => {
  it("signs in with email when the identifier contains @", async () => {
    const deps = makeDeps();

    const result = await submitSignin(emailValues, deps);

    expect(result).toEqual({ ok: true });
    expect(deps.signInEmail).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "correct-horse",
    });
    expect(deps.signInUsername).not.toHaveBeenCalled();
  });

  it("signs in with username otherwise", async () => {
    const deps = makeDeps();

    await submitSignin(usernameValues, deps);

    expect(deps.signInUsername).toHaveBeenCalledWith({
      username: "ada",
      password: "correct-horse",
    });
    expect(deps.signInEmail).not.toHaveBeenCalled();
  });

  it("returns the invalid-credentials message on error", async () => {
    const result = await submitSignin(emailValues, makeDeps({ emailError: true }));

    expect(result).toEqual({ ok: false, message: INVALID_CREDENTIALS_MESSAGE });
  });
});
