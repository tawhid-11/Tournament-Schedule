import { describe, it, expect } from "vitest";
import { autoScheduleMatches } from "@/lib/scheduler/constraints";
import { validateScheduleConflicts } from "@/lib/scheduler/conflict-detector";
import { SchedulerMatch, SchedulerVenue } from "@/lib/scheduler/types";

describe("Scheduler - Constraints & Conflict Detector", () => {
  const venues: SchedulerVenue[] = [
    { id: "v1", name: "Main Stadium", isAvailable: true },
    { id: "v2", name: "Field B", isAvailable: true },
  ];

  const matches: SchedulerMatch[] = [
    { id: "m1", round: 1, matchday: 1, homeTeamId: "t1", awayTeamId: "t2" },
    { id: "m2", round: 1, matchday: 1, homeTeamId: "t3", awayTeamId: "t4" },
    { id: "m3", round: 2, matchday: 2, homeTeamId: "t1", awayTeamId: "t3" },
    { id: "m4", round: 2, matchday: 2, homeTeamId: "t2", awayTeamId: "t4" },
  ];

  it("should auto-schedule all matches with valid timestamps and venue assignments", () => {
    const scheduled = autoScheduleMatches(matches, venues, {
      startDate: new Date("2026-06-01T00:00:00Z"),
      timeSlots: ["14:00", "18:00"],
      minRestDays: 1,
    });

    expect(scheduled).toHaveLength(4);
    for (const m of scheduled) {
      expect(m.scheduledAt).toBeDefined();
      expect(m.venueId).toBeDefined();
    }
  });

  it("should detect conflict when a team is scheduled twice on the same day", () => {
    const invalidSchedule: SchedulerMatch[] = [
      {
        id: "m1",
        round: 1,
        homeTeamId: "t1",
        awayTeamId: "t2",
        scheduledAt: new Date("2026-06-01T14:00:00Z"),
        venueId: "v1",
      },
      {
        id: "m2",
        round: 1,
        homeTeamId: "t1",
        awayTeamId: "t3",
        scheduledAt: new Date("2026-06-01T19:00:00Z"),
        venueId: "v1",
      },
    ];

    const conflicts = validateScheduleConflicts(invalidSchedule, venues);
    const doubleBooked = conflicts.find((c) => c.type === "TEAM_DOUBLE_BOOKED");
    expect(doubleBooked).toBeDefined();
    expect(doubleBooked?.teamId).toBe("t1");
  });

  it("should detect conflict when a venue is double-booked at the same time", () => {
    const sameTime = new Date("2026-06-01T15:00:00Z");
    const conflictingVenueSchedule: SchedulerMatch[] = [
      {
        id: "m1",
        round: 1,
        homeTeamId: "t1",
        awayTeamId: "t2",
        scheduledAt: sameTime,
        venueId: "v1",
      },
      {
        id: "m2",
        round: 1,
        homeTeamId: "t3",
        awayTeamId: "t4",
        scheduledAt: sameTime,
        venueId: "v1",
      },
    ];

    const conflicts = validateScheduleConflicts(conflictingVenueSchedule, venues);
    const venueConflict = conflicts.find((c) => c.type === "VENUE_OVERBOOKED");
    expect(venueConflict).toBeDefined();
    expect(venueConflict?.venueId).toBe("v1");
  });
});
