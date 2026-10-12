import { describe, expect, it } from "vitest";

import {
  deriveDateOutcomes,
  expectedActivityIdsOnDate,
  versionEffectiveOn,
  type ExecutionInput,
  type ScheduleVersionInput,
} from "./derive";

const monWedFri = ["MONDAY", "WEDNESDAY", "FRIDAY"] as ScheduleVersionInput["days"];
const tueThu = ["TUESDAY", "THURSDAY"] as ScheduleVersionInput["days"];

const versions: ScheduleVersionInput[] = [
  {
    activityId: "a1",
    effectiveStartDate: "2026-09-28",
    effectiveEndDate: "2026-10-04",
    expectedDurationMinutes: 30,
    days: monWedFri,
  },
  {
    activityId: "a1",
    effectiveStartDate: "2026-10-05",
    effectiveEndDate: null,
    expectedDurationMinutes: 45,
    days: tueThu,
  },
];

describe("versionEffectiveOn", () => {
  it("picks the version governing the date", () => {
    // 2026-10-02 (Friday) falls in the first version's period.
    expect(versionEffectiveOn(versions, "a1", "2026-10-02")?.days).toEqual(monWedFri);
    // 2026-10-06 (Tuesday) falls in the second version's period.
    expect(versionEffectiveOn(versions, "a1", "2026-10-06")?.days).toEqual(tueThu);
  });

  it("returns null before any version starts", () => {
    expect(versionEffectiveOn(versions, "a1", "2026-09-27")).toBeNull();
  });

  it("prefers the latest effective start when versions overlap", () => {
    const overlapping: ScheduleVersionInput[] = [
      {
        activityId: "a1",
        effectiveStartDate: "2026-09-28",
        effectiveEndDate: null,
        expectedDurationMinutes: null,
        days: monWedFri,
      },
      {
        activityId: "a1",
        effectiveStartDate: "2026-10-05",
        effectiveEndDate: null,
        expectedDurationMinutes: null,
        days: tueThu,
      },
    ];

    expect(versionEffectiveOn(overlapping, "a1", "2026-10-06")?.days).toEqual(tueThu);
  });
});

describe("expectedActivityIdsOnDate", () => {
  it("uses the plan that was in effect on that date, not the current one", () => {
    // Friday under the old Mon/Wed/Fri version.
    expect(expectedActivityIdsOnDate(versions, "2026-10-02")).toEqual(["a1"]);
    // Monday under the new Tue/Thu version — not expected.
    expect(expectedActivityIdsOnDate(versions, "2026-10-05")).toEqual([]);
    // Tuesday under the new version.
    expect(expectedActivityIdsOnDate(versions, "2026-10-06")).toEqual(["a1"]);
  });

  it("ignores activities with no governing version", () => {
    expect(expectedActivityIdsOnDate(versions, "2026-09-25")).toEqual([]);
  });
});

describe("deriveDateOutcomes", () => {
  const executions: ExecutionInput[] = [
    {
      activityId: "a1",
      date: "2026-10-06",
      status: "PARTIAL",
      note: "Only had 20 minutes",
    },
    {
      activityId: "a1",
      date: "2026-10-08",
      status: "NOT_COMPLETED",
      note: null,
    },
  ];

  it("joins expected activities with recorded executions", () => {
    const outcomes = deriveDateOutcomes("2026-10-06", versions, executions);

    expect(outcomes).toEqual([
      {
        activityId: "a1",
        status: "PARTIAL",
        note: "Only had 20 minutes",
        expectedDurationMinutes: 45,
      },
    ]);
  });

  it("treats a missing execution as UNRECORDED, never NOT_COMPLETED", () => {
    const outcomes = deriveDateOutcomes("2026-10-13", versions, executions);

    expect(outcomes).toEqual([
      {
        activityId: "a1",
        status: "UNRECORDED",
        note: null,
        expectedDurationMinutes: 45,
      },
    ]);
  });

  it("keeps an explicit NOT_COMPLETED as recorded", () => {
    const outcomes = deriveDateOutcomes("2026-10-08", versions, executions);

    expect(outcomes[0].status).toBe("NOT_COMPLETED");
    expect(outcomes[0].note).toBeNull();
  });

  it("returns nothing when nothing is scheduled", () => {
    expect(deriveDateOutcomes("2026-10-05", versions, executions)).toEqual([]);
  });

  it("does not count executions recorded on unscheduled dates", () => {
    // Execution exists on 2026-10-08 (Thursday, scheduled) but the same
    // status on an unscheduled Monday must not appear.
    const strayExecution: ExecutionInput[] = [
      { activityId: "a1", date: "2026-10-05", status: "COMPLETED", note: null },
    ];

    expect(deriveDateOutcomes("2026-10-05", versions, strayExecution)).toEqual([]);
  });
});
