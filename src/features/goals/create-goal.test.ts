import { describe, expect, it, vi } from "vitest";

import { GOAL_TITLE_TAKEN_MESSAGE } from "./constants";
import { createGoal } from "./create-goal";

const TODAY = "2026-10-12";

function makeDeps(options?: {
  exists?: boolean;
  raceDuplicate?: boolean;
}) {
  return {
    goalTitleExists: vi.fn(async () => options?.exists ?? false),
    createGoal: vi.fn(async () =>
      options?.raceDuplicate
        ? ({ ok: false as const, code: "DUPLICATE_TITLE" as const })
        : ({ ok: true as const }),
    ),
  };
}

describe("createGoal", () => {
  it("creates a goal with valid input and trimmed title", async () => {
    const deps = makeDeps();

    const result = await createGoal(
      "user-1",
      { title: "  Learn English  ", startDate: "2026-10-12", endDate: null },
      TODAY,
      deps,
    );

    expect(result).toEqual({ ok: true });
    expect(deps.createGoal).toHaveBeenCalledWith("user-1", {
      title: "Learn English",
      startDate: "2026-10-12",
      endDate: null,
    });
  });

  it("accepts an optional end date on or after the start date", async () => {
    const deps = makeDeps();

    const result = await createGoal(
      "user-1",
      { title: "Read more", startDate: "2026-10-12", endDate: "2026-12-31" },
      TODAY,
      deps,
    );

    expect(result).toEqual({ ok: true });
    expect(deps.createGoal).toHaveBeenCalledWith("user-1", {
      title: "Read more",
      startDate: "2026-10-12",
      endDate: "2026-12-31",
    });
  });

  it("rejects a start date in the past", async () => {
    const deps = makeDeps();

    const result = await createGoal(
      "user-1",
      { title: "Learn English", startDate: "2026-10-11", endDate: null },
      TODAY,
      deps,
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { startDate: "Start date must be today or in the future" },
    });
    expect(deps.createGoal).not.toHaveBeenCalled();
  });

  it("rejects an end date before the start date", async () => {
    const deps = makeDeps();

    const result = await createGoal(
      "user-1",
      { title: "Learn English", startDate: "2026-10-12", endDate: "2026-10-11" },
      TODAY,
      deps,
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { endDate: "End date must be on or after the start date" },
    });
    expect(deps.createGoal).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    const deps = makeDeps();

    const result = await createGoal(
      "user-1",
      { title: "   ", startDate: "2026-10-12", endDate: null },
      TODAY,
      deps,
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { title: "Goal title is required" },
    });
  });

  it("rejects a duplicate ACTIVE title", async () => {
    const deps = makeDeps({ exists: true });

    const result = await createGoal(
      "user-1",
      { title: "Learn English", startDate: "2026-10-12", endDate: null },
      TODAY,
      deps,
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { title: GOAL_TITLE_TAKEN_MESSAGE },
    });
    expect(deps.createGoal).not.toHaveBeenCalled();
  });

  it("maps a concurrent unique-index violation to a title error", async () => {
    const deps = makeDeps({ raceDuplicate: true });

    const result = await createGoal(
      "user-1",
      { title: "Learn English", startDate: "2026-10-12", endDate: null },
      TODAY,
      deps,
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { title: GOAL_TITLE_TAKEN_MESSAGE },
    });
  });
});
