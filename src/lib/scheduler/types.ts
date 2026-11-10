export interface SchedulerVenue {
  id: string;
  name: string;
  isAvailable?: boolean;
}

export interface SchedulerMatch {
  id: string;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  round: number;
  matchday?: number;
  scheduledAt?: Date | string | null;
  venueId?: string | null;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  winnerTeamId?: string | null;
}

export interface SchedulerConstraints {
  startDate: Date;
  timeSlots: string[]; // e.g. ["14:00", "16:30", "19:00"]
  minRestDays: number; // e.g. 1
  maxMatchesPerDayPerVenue?: number;
  allowSameDayTeamMatch?: boolean; // default false
  preferredDaysOfWeek?: number[]; // [0,1,2,3,4,5,6] (0 = Sunday)
}

export type ConflictSeverity = "ERROR" | "WARNING";

export interface ScheduleConflict {
  type:
    | "TEAM_DOUBLE_BOOKED"
    | "REST_DAY_VIOLATION"
    | "VENUE_OVERBOOKED"
    | "VENUE_UNAVAILABLE";
  matchId: string;
  conflictingMatchId?: string;
  teamId?: string;
  venueId?: string;
  message: string;
  severity: ConflictSeverity;
}
