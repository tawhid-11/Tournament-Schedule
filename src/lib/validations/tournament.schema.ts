import { z } from "zod";

export const CreateTournamentSchema = z.object({
  name: z.string().min(3, "Tournament name must be at least 3 characters"),
  sportType: z.enum([
    "FOOTBALL",
    "CRICKET",
    "BADMINTON",
    "BASKETBALL",
    "TENNIS",
    "ESPORTS",
    "CUSTOM",
  ]),
  sportLabel: z.string().min(2, "Sport label is required"),
  scoreModel: z.enum(["GOALS", "POINTS", "SETS_GAMES", "CRICKET_RUNS"]),
  format: z.enum([
    "SINGLE_ELIMINATION",
    "DOUBLE_ELIMINATION",
    "ROUND_ROBIN",
    "GROUP_AND_KNOCKOUT",
    "LEAGUE_PLAYOFFS",
    "SWISS",
    "CUSTOM_MULTI_STAGE",
  ]),
  season: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export const AddTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  shortName: z.string().min(1).max(10, "Short name max 10 characters"),
  primaryColor: z.string().optional().default("#2563eb"),
  secondaryColor: z.string().optional().default("#ffffff"),
  seed: z.number().int().positive().optional(),
  pot: z.number().int().positive().optional(),
});

export const BulkAddTeamsSchema = z.object({
  teams: z.array(AddTeamSchema),
});

export const ConfigureGroupsSchema = z.object({
  numberOfGroups: z.number().int().min(1).max(16),
  advancePerGroup: z.number().int().min(1).default(2),
  groupNames: z.array(z.string()).optional(),
});

export const AutoDrawSchema = z.object({
  method: z.enum(["SEEDED_POTS", "RANDOM", "SNAKE"]),
  numberOfGroups: z.number().int().min(1).max(16),
  advancePerGroup: z.number().int().min(1).default(2),
});

export const UpdateScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  isWalkover: z.boolean().optional(),
  walkoverWinnerId: z.string().optional(),
  isExtraTime: z.boolean().optional(),
  isPenalties: z.boolean().optional(),
  homePenaltyScore: z.number().int().min(0).optional(),
  awayPenaltyScore: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const AutoScheduleSchema = z.object({
  startDate: z.string(),
  timeSlots: z.array(z.string()).min(1),
  minRestDays: z.number().int().min(0).default(1),
  maxMatchesPerDayPerVenue: z.number().int().min(1).default(3),
  venueIds: z.array(z.string()).optional(),
});

export const UpdateMatchScheduleSchema = z.object({
  scheduledAt: z.string().nullable().optional(),
  venueId: z.string().nullable().optional(),
});
