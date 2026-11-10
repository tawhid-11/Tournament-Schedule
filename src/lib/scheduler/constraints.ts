import {
  SchedulerMatch,
  SchedulerVenue,
  SchedulerConstraints,
} from "./types";

/**
 * Auto-schedules matches across available calendar days, time slots, and venues.
 * Respects:
 * - Minimum rest days between matches for any team
 * - Maximum matches per venue per day
 * - No team playing twice on the same day
 * - Round-by-round ordering (Round 1 finishes before Round 2)
 */
export function autoScheduleMatches<T extends SchedulerMatch>(
  matches: T[],
  venues: SchedulerVenue[],
  constraints: SchedulerConstraints
): T[] {
  if (matches.length === 0) return [];

  const {
    startDate,
    timeSlots = ["14:00", "16:30", "19:00"],
    minRestDays = 1,
    maxMatchesPerDayPerVenue = 3,
    preferredDaysOfWeek,
  } = constraints;

  const availableVenues = venues.filter((v) => v.isAvailable !== false);
  const defaultVenueId = availableVenues[0]?.id || null;

  // Group matches by round or matchday so earlier rounds are scheduled first
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return (a.matchday ?? 0) - (b.matchday ?? 0);
  });

  const scheduledMatches: T[] = [];
  // Track last played date for each team: teamId -> Date
  const teamLastPlayed = new Map<string, Date>();
  // Track count of matches scheduled per venue per calendar date string: "venueId:YYYY-MM-DD" -> count
  const venueDailyLoad = new Map<string, number>();

  let currentDate = new Date(startDate);

  function getNextValidDate(date: Date): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    // If specific days of week requested
    if (preferredDaysOfWeek && preferredDaysOfWeek.length > 0) {
      while (!preferredDaysOfWeek.includes(next.getDay())) {
        next.setDate(next.getDate() + 1);
      }
    }
    return next;
  }

  function getDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function parseTimeSlot(date: Date, timeSlot: string): Date {
    const [hours, minutes] = timeSlot.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  let slotIndex = 0;
  let venueIndex = 0;

  for (const match of sortedMatches) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 365; // Avoid infinite loops

    while (!placed && attempts < maxAttempts) {
      attempts++;

      // Check if either team has rest day conflict on currentDate
      let teamConflict = false;
      const teamsInMatch = [match.homeTeamId, match.awayTeamId].filter(
        Boolean
      ) as string[];

      for (const tId of teamsInMatch) {
        const last = teamLastPlayed.get(tId);
        if (last) {
          const diffMs = Math.abs(currentDate.getTime() - last.getTime());
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays <= minRestDays) {
            teamConflict = true;
            break;
          }
        }
      }

      if (teamConflict) {
        // Advance to next day
        currentDate = getNextValidDate(currentDate);
        slotIndex = 0;
        continue;
      }

      // Check venue capacity for current day
      const currentVenue = availableVenues[venueIndex] || null;
      const vKey = `${currentVenue?.id || "novenue"}:${getDateKey(currentDate)}`;
      const currentLoad = venueDailyLoad.get(vKey) || 0;

      if (currentVenue && currentLoad >= maxMatchesPerDayPerVenue) {
        // Try another venue or next day
        venueIndex = (venueIndex + 1) % availableVenues.length;
        if (venueIndex === 0) {
          currentDate = getNextValidDate(currentDate);
          slotIndex = 0;
        }
        continue;
      }

      // Assign time slot
      const timeSlot = timeSlots[slotIndex % timeSlots.length];
      const scheduledAt = parseTimeSlot(currentDate, timeSlot);

      scheduledMatches.push({
        ...match,
        scheduledAt,
        venueId: currentVenue ? currentVenue.id : defaultVenueId,
      });

      // Update trackers
      teamsInMatch.forEach((tId) => teamLastPlayed.set(tId, scheduledAt));
      venueDailyLoad.set(vKey, currentLoad + 1);

      placed = true;

      // Advance slot
      slotIndex++;
      if (slotIndex >= timeSlots.length) {
        slotIndex = 0;
        venueIndex = (venueIndex + 1) % (availableVenues.length || 1);
        if (venueIndex === 0) {
          currentDate = getNextValidDate(currentDate);
        }
      }
    }

    if (!placed) {
      // Fallback: place on current date
      scheduledMatches.push({
        ...match,
        scheduledAt: currentDate,
        venueId: defaultVenueId,
      });
    }
  }

  return scheduledMatches;
}
