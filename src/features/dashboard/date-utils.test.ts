import { describe, expect, it } from "vitest";

import {
  addDays,
  dayOfWeekEnumFor,
  localDateInTimezone,
  localHourInTimezone,
  rangeOfDates,
  weekStart,
} from "./date-utils";

describe("localDateInTimezone", () => {
  it("returns the calendar date inside the user's timezone", () => {
    // 2026-10-11 22:30 UTC is already 2026-10-12 in Tehran (UTC+3:30).
    expect(localDateInTimezone("Asia/Tehran", new Date("2026-10-11T22:30:00Z"))).toBe(
      "2026-10-12",
    );
    expect(localDateInTimezone("UTC", new Date("2026-10-11T22:30:00Z"))).toBe(
      "2026-10-11",
    );
  });

  it("handles negative offsets", () => {
    // 2026-10-12 01:30 UTC is still 2026-10-11 in New York (UTC-4 in October).
    expect(localDateInTimezone("America/New_York", new Date("2026-10-12T01:30:00Z"))).toBe(
      "2026-10-11",
    );
  });
});

describe("localHourInTimezone", () => {
  it("returns the hour in the user's timezone", () => {
    expect(localHourInTimezone("Asia/Tehran", new Date("2026-10-11T22:30:00Z"))).toBe(
      2,
    );
    expect(localHourInTimezone("UTC", new Date("2026-10-11T22:30:00Z"))).toBe(22);
  });
});

describe("dayOfWeekEnumFor", () => {
  it("maps calendar dates to domain day names", () => {
    expect(dayOfWeekEnumFor("2026-10-12")).toBe("MONDAY");
    expect(dayOfWeekEnumFor("2026-10-11")).toBe("SUNDAY");
    expect(dayOfWeekEnumFor("2026-10-09")).toBe("FRIDAY");
  });
});

describe("addDays", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });
});

describe("weekStart", () => {
  it("returns Monday of the same week", () => {
    expect(weekStart("2026-10-12")).toBe("2026-10-12"); // Monday
    expect(weekStart("2026-10-14")).toBe("2026-10-12"); // Wednesday
    expect(weekStart("2026-10-11")).toBe("2026-10-05"); // Sunday
  });
});

describe("rangeOfDates", () => {
  it("returns an inclusive list of dates", () => {
    expect(rangeOfDates("2026-10-05", "2026-10-07")).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
    ]);
  });

  it("returns empty when the range is inverted", () => {
    expect(rangeOfDates("2026-10-07", "2026-10-05")).toEqual([]);
  });
});
