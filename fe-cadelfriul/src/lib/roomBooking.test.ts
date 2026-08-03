import { describe, expect, it } from "vitest";
import { computeNights, findBlockedDate, toDateKey } from "./roomBooking";

describe("toDateKey", () => {
  it("formats a local date as a zero-padded yyyy-MM-dd key", () => {
    expect(toDateKey(new Date(2026, 7, 10))).toBe("2026-08-10");
  });

  it("zero-pads single-digit months and days", () => {
    expect(toDateKey(new Date(2026, 0, 3))).toBe("2026-01-03");
  });
});

describe("computeNights", () => {
  it("counts adjacent days as 1 night", () => {
    expect(computeNights(new Date(2026, 7, 1), new Date(2026, 7, 2))).toBe(1);
  });

  it("counts a 5-day span as 4 nights", () => {
    expect(computeNights(new Date(2026, 7, 1), new Date(2026, 7, 5))).toBe(4);
  });

  it("returns 0 when to is before from", () => {
    expect(computeNights(new Date(2026, 7, 10), new Date(2026, 7, 5))).toBe(0);
  });

  it("returns 0 for the same day", () => {
    expect(computeNights(new Date(2026, 7, 10), new Date(2026, 7, 10))).toBe(0);
  });
});

describe("findBlockedDate", () => {
  const booked = new Set(["2026-08-12"]);

  it("returns null when from and to are adjacent (no interior)", () => {
    expect(
      findBlockedDate(new Date(2026, 7, 10), new Date(2026, 7, 11), booked, "2026-08-10")
    ).toBeNull();
  });

  it("returns null when the interior is clean", () => {
    expect(
      findBlockedDate(new Date(2026, 7, 10), new Date(2026, 7, 14), new Set(), "2026-08-10")
    ).toBeNull();
  });

  it("returns the booked key when the interior contains it", () => {
    expect(
      findBlockedDate(new Date(2026, 7, 10), new Date(2026, 7, 14), booked, "2026-08-10")
    ).toBe("2026-08-12");
  });

  it("returns a past interior date when its key is before todayKey", () => {
    expect(
      findBlockedDate(new Date(2026, 7, 2), new Date(2026, 7, 8), new Set(), "2026-08-06")
    ).toBe("2026-08-03");
  });

  it("ignores a booked endpoint (from or to itself in blockedKeys)", () => {
    expect(
      findBlockedDate(
        new Date(2026, 7, 12),
        new Date(2026, 7, 16),
        booked,
        "2026-08-10"
      )
    ).toBeNull();
    expect(
      findBlockedDate(
        new Date(2026, 7, 10),
        new Date(2026, 7, 12),
        booked,
        "2026-08-10"
      )
    ).toBeNull();
  });
});
