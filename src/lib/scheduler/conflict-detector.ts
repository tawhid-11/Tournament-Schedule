import {
  SchedulerMatch,
  ScheduleConflict,
  SchedulerVenue,
} from "./types";

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

function areSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

function getDaysBetween(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  return Math.abs(Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)));
}

/**
 * Detects all scheduling conflicts across matches:
 * - Same team double booked at the same time or day
 * - Minimum rest days violated between a team's consecutive games
 * - Venue double booked at the same time slot
 */
export function validateScheduleConflicts(
  matches: SchedulerMatch[],
  venues: SchedulerVenue[] = [],
  minRestDays = 1
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  // Sort scheduled matches chronologically
  const scheduled = matches
    .filter((m) => m.scheduledAt)
    .map((m) => ({ ...m, dateObj: toDate(m.scheduledAt)! }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // 1. Check Venue Overbooking
  for (let i = 0; i < scheduled.length; i++) {
    const m1 = scheduled[i];

    if (m1.venueId) {
      const v = venueMap.get(m1.venueId);
      if (v && v.isAvailable === false) {
        conflicts.push({
          type: "VENUE_UNAVAILABLE",
          matchId: m1.id,
          venueId: m1.venueId,
          message: `Venue "${v.name}" is marked as unavailable.`,
          severity: "ERROR",
        });
      }

      for (let j = i + 1; j < scheduled.length; j++) {
        const m2 = scheduled[j];
        if (m1.venueId === m2.venueId) {
          // Exact same start time = double booking
          if (m1.dateObj.getTime() === m2.dateObj.getTime()) {
            conflicts.push({
              type: "VENUE_OVERBOOKED",
              matchId: m2.id,
              conflictingMatchId: m1.id,
              venueId: m1.venueId,
              message: `Venue is double-booked at ${m1.dateObj.toLocaleString()} between Match #${m1.id} and Match #${m2.id}.`,
              severity: "ERROR",
            });
          }
        }
      }
    }
  }

  // 2. Check Team Scheduling (double booking & rest days)
  const teamMatches = new Map<string, Array<{ match: SchedulerMatch; date: Date }>>();

  for (const m of scheduled) {
    if (m.homeTeamId) {
      if (!teamMatches.has(m.homeTeamId)) teamMatches.set(m.homeTeamId, []);
      teamMatches.get(m.homeTeamId)!.push({ match: m, date: m.dateObj });
    }
    if (m.awayTeamId) {
      if (!teamMatches.has(m.awayTeamId)) teamMatches.set(m.awayTeamId, []);
      teamMatches.get(m.awayTeamId)!.push({ match: m, date: m.dateObj });
    }
  }

  teamMatches.forEach((matchList, teamId) => {
    // Sort chronological
    matchList.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < matchList.length - 1; i++) {
      const current = matchList[i];
      const next = matchList[i + 1];

      // Same calendar day check
      if (areSameDay(current.date, next.date)) {
        conflicts.push({
          type: "TEAM_DOUBLE_BOOKED",
          matchId: next.match.id,
          conflictingMatchId: current.match.id,
          teamId,
          message: `Team is scheduled to play twice on the same day (${current.date.toDateString()}).`,
          severity: "ERROR",
        });
      } else {
        // Rest day check
        const daysDiff = getDaysBetween(current.date, next.date);
        const restDays = daysDiff - 1;
        if (restDays < minRestDays) {
          conflicts.push({
            type: "REST_DAY_VIOLATION",
            matchId: next.match.id,
            conflictingMatchId: current.match.id,
            teamId,
            message: `Team has only ${restDays} rest day(s) between matches, violating minimum requirement of ${minRestDays} day(s).`,
            severity: "WARNING",
          });
        }
      }
    }
  });

  return conflicts;
}
