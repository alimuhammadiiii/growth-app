import { beforeEach, describe, expect, it, vi } from "vitest";

import { emailExists, usernameExists } from "@/db/repositories/users";

import { checkEmailAvailability, checkUsernameAvailability } from "./actions";

vi.mock("@/db/repositories/users", () => ({
  emailExists: vi.fn(),
  usernameExists: vi.fn(),
}));

describe("checkEmailAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks the lowercase-normalized email", async () => {
    vi.mocked(emailExists).mockResolvedValue(false);

    expect(await checkEmailAvailability("Ada@Example.com")).toBe(true);
    expect(emailExists).toHaveBeenCalledWith("ada@example.com");
  });

  it("returns false when the email is taken", async () => {
    vi.mocked(emailExists).mockResolvedValue(true);

    expect(await checkEmailAvailability("ada@example.com")).toBe(false);
  });

  it("returns null without querying when the email is invalid", async () => {
    expect(await checkEmailAvailability("not-an-email")).toBeNull();
    expect(emailExists).not.toHaveBeenCalled();
  });
});

describe("checkUsernameAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks the lowercase-normalized username", async () => {
    vi.mocked(usernameExists).mockResolvedValue(true);

    expect(await checkUsernameAvailability("Ada")).toBe(false);
    expect(usernameExists).toHaveBeenCalledWith("ada");
  });

  it("returns true when the username is available", async () => {
    vi.mocked(usernameExists).mockResolvedValue(false);

    expect(await checkUsernameAvailability("ada")).toBe(true);
  });

  it("returns null without querying when the username is invalid", async () => {
    expect(await checkUsernameAvailability("no")).toBeNull();
    expect(usernameExists).not.toHaveBeenCalled();
  });
});
