import {
  EngineTeam,
  EngineMatch,
  generateRoundRobin,
  generateSingleElimination,
  generateDoubleElimination,
  generateSwissRound,
  autoDrawGroups,
  resolveBracketProgression,
  computeStandings,
  StandingEntry,
} from "./fixture-engine";
import {
  autoScheduleMatches,
  validateScheduleConflicts,
  ScheduleConflict,
  SchedulerVenue,
} from "./scheduler";
import { slugify } from "./utils";

export interface StoredGroup {
  id: string;
  name: string;
  sortOrder: number;
  advanceCount: number;
  teams: EngineTeam[];
}

export interface StoredStage {
  id: string;
  tournamentId: string;
  stageOrder: number;
  name: string;
  stageType:
    | "GROUP"
    | "ROUND_ROBIN"
    | "SINGLE_ELIMINATION"
    | "DOUBLE_ELIMINATION"
    | "SWISS"
    | "PLAYOFF";
  config?: any;
}

export interface StoredMatch extends EngineMatch {
  homeScore?: number;
  awayScore?: number;
  completedAt?: Date;
  venueName?: string;
}

export interface StoredTournament {
  id: string;
  userId: string;
  name: string;
  slug: string;
  sportType: string;
  sportLabel: string;
  scoreModel: string;
  season?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  teams: EngineTeam[];
  stages: StoredStage[];
  groups: StoredGroup[];
  venues: SchedulerVenue[];
  matches: StoredMatch[];
  conflicts: ScheduleConflict[];
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __tournamentsMap: Map<string, StoredTournament> | undefined;
}

// In-memory persistent state across Next.js route chunks during process lifetime
const tournamentsMap: Map<string, StoredTournament> =
  globalThis.__tournamentsMap || new Map<string, StoredTournament>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__tournamentsMap = tournamentsMap;
}

// Initialize Seed Data
function initSeedData() {
  if (tournamentsMap.size > 0) return;

  // 1. Apex Global Football Championship (16 Teams Groups + Knockout)
  const wcTeams: EngineTeam[] = [
    { id: "wc-1", name: "Atlas Eagles", shortName: "EGL", seed: 1, pot: 1 },
    { id: "wc-2", name: "Solaris FC", shortName: "SOL", seed: 2, pot: 1 },
    { id: "wc-3", name: "Nordic Wolves", shortName: "WLV", seed: 3, pot: 1 },
    { id: "wc-4", name: "Imperial Titans", shortName: "TTN", seed: 4, pot: 1 },
    { id: "wc-5", name: "Phoenix Blaze", shortName: "BLZ", seed: 5, pot: 2 },
    { id: "wc-6", name: "Thunderbolts", shortName: "TBT", seed: 6, pot: 2 },
    { id: "wc-7", name: "Emerald Knights", shortName: "KNT", seed: 7, pot: 2 },
    { id: "wc-8", name: "Pacific Sharks", shortName: "SHK", seed: 8, pot: 2 },
    { id: "wc-9", name: "Red Dragons", shortName: "RDG", seed: 9, pot: 3 },
    { id: "wc-10", name: "Cobalt Stars", shortName: "CBT", seed: 10, pot: 3 },
    { id: "wc-11", name: "Silver Lynx", shortName: "LNX", seed: 11, pot: 3 },
    { id: "wc-12", name: "Golden Bears", shortName: "GBR", seed: 12, pot: 3 },
    { id: "wc-13", name: "Vanguard United", shortName: "VGD", seed: 13, pot: 4 },
    { id: "wc-14", name: "Crimson Rangers", shortName: "CRG", seed: 14, pot: 4 },
    { id: "wc-15", name: "Cyber Strikers", shortName: "STR", seed: 15, pot: 4 },
    { id: "wc-16", name: "Apex Pioneers", shortName: "PNR", seed: 16, pot: 4 },
  ];

  const wcVenues: SchedulerVenue[] = [
    { id: "v1", name: "Olympic Grand Arena", isAvailable: true },
    { id: "v2", name: "Centennial Park Stadium", isAvailable: true },
    { id: "v3", name: "Sunset Dome", isAvailable: true },
  ];

  const wcStageGroups: StoredStage = {
    id: "stg-wc-1",
    tournamentId: "t-apex-2026",
    stageOrder: 1,
    name: "Group Stage",
    stageType: "GROUP",
    config: { legs: 1, advancePerGroup: 2 },
  };

  const wcStageKnockout: StoredStage = {
    id: "stg-wc-2",
    tournamentId: "t-apex-2026",
    stageOrder: 2,
    name: "Knockout Stage",
    stageType: "SINGLE_ELIMINATION",
    config: { legs: 1, hasThirdPlace: true },
  };

  const wcGroups: StoredGroup[] = [
    {
      id: "grp-a",
      name: "Group A",
      sortOrder: 1,
      advanceCount: 2,
      teams: [wcTeams[0], wcTeams[4], wcTeams[8], wcTeams[12]],
    },
    {
      id: "grp-b",
      name: "Group B",
      sortOrder: 2,
      advanceCount: 2,
      teams: [wcTeams[1], wcTeams[5], wcTeams[9], wcTeams[13]],
    },
    {
      id: "grp-c",
      name: "Group C",
      sortOrder: 3,
      advanceCount: 2,
      teams: [wcTeams[2], wcTeams[6], wcTeams[10], wcTeams[14]],
    },
    {
      id: "grp-d",
      name: "Group D",
      sortOrder: 4,
      advanceCount: 2,
      teams: [wcTeams[3], wcTeams[7], wcTeams[11], wcTeams[15]],
    },
  ];

  // Generate Group Stage Matches
  const groupMatches: StoredMatch[] = [];
  let mCount = 1;
  for (const grp of wcGroups) {
    const gMatches = generateRoundRobin(grp.teams, {
      stageId: wcStageGroups.id,
      groupId: grp.id,
      legs: 1,
      startMatchNumber: mCount,
    });
    groupMatches.push(...gMatches);
    mCount += gMatches.length;
  }

  // Generate Knockout matches (QF, SF, 3rd Place, Final)
  const dummyKnockoutTeams: EngineTeam[] = [
    { id: "qf-1", name: "Winner Group A", seed: 1 },
    { id: "qf-2", name: "Runner-up Group B", seed: 2 },
    { id: "qf-3", name: "Winner Group C", seed: 3 },
    { id: "qf-4", name: "Runner-up Group D", seed: 4 },
    { id: "qf-5", name: "Winner Group B", seed: 5 },
    { id: "qf-6", name: "Runner-up Group A", seed: 6 },
    { id: "qf-7", name: "Winner Group D", seed: 7 },
    { id: "qf-8", name: "Runner-up Group C", seed: 8 },
  ];

  const knockoutMatches = generateSingleElimination(dummyKnockoutTeams, {
    stageId: wcStageKnockout.id,
    hasThirdPlace: true,
    startRound: 4,
    startMatchNumber: mCount,
  });

  const allWcMatches: StoredMatch[] = [...groupMatches, ...knockoutMatches];

  // Auto-schedule matches
  const scheduledWc = autoScheduleMatches(allWcMatches, wcVenues, {
    startDate: new Date("2026-06-10T14:00:00Z"),
    timeSlots: ["14:00", "17:00", "20:00"],
    minRestDays: 1,
  });

  // Complete a couple of matches with scores for instant live demo
  if (scheduledWc.length > 0) {
    scheduledWc[0].status = "COMPLETED";
    scheduledWc[0].homeScore = 2;
    scheduledWc[0].awayScore = 1;
    scheduledWc[0].winnerTeamId = scheduledWc[0].homeTeamId;
  }
  if (scheduledWc.length > 1) {
    scheduledWc[1].status = "COMPLETED";
    scheduledWc[1].homeScore = 1;
    scheduledWc[1].awayScore = 1;
  }

  tournamentsMap.set("t-apex-2026", {
    id: "t-apex-2026",
    userId: "demo-user-id",
    name: "Apex Global Football Championship 2026",
    slug: "apex-football-2026",
    sportType: "FOOTBALL",
    sportLabel: "Football",
    scoreModel: "GOALS",
    season: "2026/2027",
    startDate: "2026-06-10",
    endDate: "2026-07-15",
    isPublic: true,
    teams: wcTeams,
    stages: [wcStageGroups, wcStageKnockout],
    groups: wcGroups,
    venues: wcVenues,
    matches: scheduledWc,
    conflicts: validateScheduleConflicts(scheduledWc, wcVenues),
    createdAt: new Date().toISOString(),
  });

  // 2. Cyber Masters Invitational 2026 (8 Teams Single Elimination)
  const esTeams: EngineTeam[] = [
    { id: "es-1", name: "Team Liquid Echo", shortName: "TL", seed: 1 },
    { id: "es-2", name: "Sentinels Redux", shortName: "SEN", seed: 2 },
    { id: "es-3", name: "Fnatic Rising", shortName: "FNC", seed: 3 },
    { id: "es-4", name: "Paper Rex Velocity", shortName: "PRX", seed: 4 },
    { id: "es-5", name: "Cloud9 Hyper", shortName: "C9", seed: 5 },
    { id: "es-6", name: "NaVi Cyber", shortName: "NAVI", seed: 6 },
    { id: "es-7", name: "LOUD Dynasty", shortName: "LOUD", seed: 7 },
    { id: "es-8", name: "DRX Strikers", shortName: "DRX", seed: 8 },
  ];

  const esVenues: SchedulerVenue[] = [
    { id: "ev-1", name: "Esports Cyber Dome", isAvailable: true },
  ];

  const esStage: StoredStage = {
    id: "stg-es-1",
    tournamentId: "t-cyber-2026",
    stageOrder: 1,
    name: "Championship Bracket",
    stageType: "SINGLE_ELIMINATION",
    config: { legs: 1, hasThirdPlace: true },
  };

  const esMatches = generateSingleElimination(esTeams, {
    stageId: esStage.id,
    hasThirdPlace: true,
    startRound: 1,
    startMatchNumber: 1,
  });

  const scheduledEs = autoScheduleMatches(esMatches, esVenues, {
    startDate: new Date("2026-08-01T10:00:00Z"),
    timeSlots: ["11:00", "15:00", "19:00"],
    minRestDays: 0,
  });

  tournamentsMap.set("t-cyber-2026", {
    id: "t-cyber-2026",
    userId: "demo-user-id",
    name: "Cyber Masters Invitational 2026",
    slug: "cyber-masters-2026",
    sportType: "ESPORTS",
    sportLabel: "Valorant / CS2",
    scoreModel: "POINTS",
    season: "Season 4",
    startDate: "2026-08-01",
    endDate: "2026-08-04",
    isPublic: true,
    teams: esTeams,
    stages: [esStage],
    groups: [],
    venues: esVenues,
    matches: scheduledEs,
    conflicts: validateScheduleConflicts(scheduledEs, esVenues),
    createdAt: new Date().toISOString(),
  });
}

// Public repository methods
export const tournamentStore = {
  getAll(userId = "demo-user-id"): StoredTournament[] {
    initSeedData();
    return Array.from(tournamentsMap.values()).filter(
      (t) => t.userId === userId || t.isPublic
    );
  },

  getById(id: string): StoredTournament | null {
    initSeedData();
    return tournamentsMap.get(id) || null;
  },

  getBySlug(slug: string): StoredTournament | null {
    initSeedData();
    return (
      Array.from(tournamentsMap.values()).find((t) => t.slug === slug) || null
    );
  },

  create(data: {
    userId?: string;
    name: string;
    sportType: string;
    sportLabel: string;
    scoreModel: string;
    format: string;
    season?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }): StoredTournament {
    initSeedData();
    const id = `t-${Date.now()}`;
    const slug = `${slugify(data.name)}-${Math.floor(Math.random() * 1000)}`;

    const newTournament: StoredTournament = {
      id,
      userId: data.userId || "demo-user-id",
      name: data.name,
      slug,
      sportType: data.sportType,
      sportLabel: data.sportLabel,
      scoreModel: data.scoreModel,
      season: data.season,
      startDate: data.startDate,
      endDate: data.endDate,
      isPublic: data.isPublic ?? true,
      teams: [],
      stages: [
        {
          id: `stg-${id}-1`,
          tournamentId: id,
          stageOrder: 1,
          name:
            data.format === "GROUP_AND_KNOCKOUT"
              ? "Group Stage"
              : data.format === "ROUND_ROBIN"
              ? "League Stage"
              : "Main Bracket",
          stageType:
            data.format === "GROUP_AND_KNOCKOUT"
              ? "GROUP"
              : data.format === "ROUND_ROBIN"
              ? "ROUND_ROBIN"
              : data.format === "DOUBLE_ELIMINATION"
              ? "DOUBLE_ELIMINATION"
              : data.format === "SWISS"
              ? "SWISS"
              : "SINGLE_ELIMINATION",
        },
      ],
      groups: [],
      venues: [
        { id: `v-${id}-1`, name: "Main Stadium", isAvailable: true },
        { id: `v-${id}-2`, name: "Court 2", isAvailable: true },
      ],
      matches: [],
      conflicts: [],
      createdAt: new Date().toISOString(),
    };

    tournamentsMap.set(id, newTournament);
    return newTournament;
  },

  update(id: string, updates: Partial<StoredTournament>): StoredTournament | null {
    initSeedData();
    const current = tournamentsMap.get(id);
    if (!current) return null;
    const updated = { ...current, ...updates };
    tournamentsMap.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    initSeedData();
    return tournamentsMap.delete(id);
  },

  addTeams(
    tournamentId: string,
    teams: Array<{
      name: string;
      shortName: string;
      primaryColor?: string;
      seed?: number;
      pot?: number;
    }>
  ): StoredTournament | null {
    const t = this.getById(tournamentId);
    if (!t) return null;

    const newEngineTeams: EngineTeam[] = teams.map((team, idx) => ({
      id: `tm-${tournamentId}-${t.teams.length + idx + 1}`,
      name: team.name,
      shortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
      seed: team.seed ?? t.teams.length + idx + 1,
      pot: team.pot ?? Math.ceil((t.teams.length + idx + 1) / 4),
      primaryColor: team.primaryColor || "#2563eb",
    }));

    t.teams.push(...newEngineTeams);
    return t;
  },

  saveGroups(
    tournamentId: string,
    groups: StoredGroup[]
  ): StoredTournament | null {
    const t = this.getById(tournamentId);
    if (!t) return null;
    t.groups = groups;
    return t;
  },

  autoDraw(
    tournamentId: string,
    options: {
      method: "SEEDED_POTS" | "RANDOM" | "SNAKE";
      numberOfGroups: number;
      advancePerGroup?: number;
    }
  ): StoredTournament | null {
    const t = this.getById(tournamentId);
    if (!t) return null;

    const drawnGroups = autoDrawGroups(t.teams, options);
    t.groups = drawnGroups.map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sortOrder,
      advanceCount: g.advanceCount,
      teams: g.teams,
    }));

    return t;
  },

  generateFixtures(
    tournamentId: string,
    options: { legs?: 1 | 2; hasThirdPlace?: boolean } = {}
  ): StoredTournament | null {
    const t = this.getById(tournamentId);
    if (!t) return null;

    const allMatches: StoredMatch[] = [];
    let matchNum = 1;

    // If groups exist, generate group stage fixtures
    if (t.groups.length > 0) {
      const stage = t.stages.find((s) => s.stageType === "GROUP") || t.stages[0];
      for (const grp of t.groups) {
        const gm = generateRoundRobin(grp.teams, {
          stageId: stage.id,
          groupId: grp.id,
          legs: options.legs || 1,
          startMatchNumber: matchNum,
        });
        allMatches.push(...gm);
        matchNum += gm.length;
      }
    } else {
      // Single Stage fixture based on stageType
      const primaryStage = t.stages[0];
      if (primaryStage.stageType === "SINGLE_ELIMINATION") {
        const matches = generateSingleElimination(t.teams, {
          stageId: primaryStage.id,
          hasThirdPlace: options.hasThirdPlace ?? true,
          startMatchNumber: matchNum,
        });
        allMatches.push(...matches);
      } else if (primaryStage.stageType === "DOUBLE_ELIMINATION") {
        const matches = generateDoubleElimination(t.teams, {
          stageId: primaryStage.id,
          startMatchNumber: matchNum,
        });
        allMatches.push(...matches);
      } else if (primaryStage.stageType === "SWISS") {
        const scores = new Map<string, number>();
        const matches = generateSwissRound(t.teams, scores, {
          stageId: primaryStage.id,
          currentRound: 1,
        });
        allMatches.push(...matches);
      } else {
        const matches = generateRoundRobin(t.teams, {
          stageId: primaryStage.id,
          legs: options.legs || 1,
          startMatchNumber: matchNum,
        });
        allMatches.push(...matches);
      }
    }

    t.matches = allMatches;
    return t;
  },

  autoSchedule(
    tournamentId: string,
    constraints: {
      startDate: Date;
      timeSlots: string[];
      minRestDays: number;
    }
  ): StoredTournament | null {
    const t = this.getById(tournamentId);
    if (!t) return null;

    const scheduled = autoScheduleMatches(t.matches, t.venues, constraints);
    t.matches = scheduled;
    t.conflicts = validateScheduleConflicts(scheduled, t.venues, constraints.minRestDays);
    return t;
  },

  updateMatchScore(
    tournamentId: string,
    matchId: string,
    scoreInput: {
      homeScore: number;
      awayScore: number;
      isWalkover?: boolean;
      walkoverWinnerId?: string;
      isExtraTime?: boolean;
      isPenalties?: boolean;
      homePenaltyScore?: number;
      awayPenaltyScore?: number;
      notes?: string;
    }
  ): StoredTournament | null {
    const t = this.getById(tournamentId);
    if (!t) return null;

    const matchIndex = t.matches.findIndex((m) => m.id === matchId);
    if (matchIndex === -1) return null;

    const targetMatch = t.matches[matchIndex];
    const resolution = resolveBracketProgression(
      targetMatch,
      scoreInput,
      t.matches,
      t.teams
    );

    // Update target match
    t.matches[matchIndex] = {
      ...resolution.completedMatch,
      homeScore: scoreInput.homeScore,
      awayScore: scoreInput.awayScore,
      completedAt: new Date(),
    };

    // Update any downstream dependent matches
    resolution.updatedSubsequentMatches.forEach((updatedM) => {
      const idx = t.matches.findIndex((m) => m.id === updatedM.id);
      if (idx !== -1) {
        t.matches[idx] = {
          ...t.matches[idx],
          ...updatedM,
        };
      }
    });

    return t;
  },

  getStandings(tournamentId: string): Map<string, StandingEntry[]> {
    const t = this.getById(tournamentId);
    const standingsMap = new Map<string, StandingEntry[]>();
    if (!t) return standingsMap;

    const matchRecords = t.matches
      .filter((m) => m.status === "COMPLETED" && m.homeTeamId && m.awayTeamId)
      .map((m) => ({
        matchId: m.id,
        homeTeamId: m.homeTeamId!,
        awayTeamId: m.awayTeamId!,
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        status: m.status as any,
      }));

    if (t.groups.length > 0) {
      for (const grp of t.groups) {
        const grpMatches = matchRecords.filter((mr) => {
          const match = t.matches.find((m) => m.id === mr.matchId);
          return match?.groupId === grp.id;
        });
        const table = computeStandings(grp.teams, grpMatches);
        standingsMap.set(grp.name, table);
      }
    } else {
      const table = computeStandings(t.teams, matchRecords);
      standingsMap.set("Overall Standings", table);
    }

    return standingsMap;
  },
};
