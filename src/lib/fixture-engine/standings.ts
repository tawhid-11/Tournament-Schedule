import { EngineTeam, EngineMatch, StandingEntry, TieBreakerRule } from "./types";

export interface StandingsConfig {
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  tieBreakers?: TieBreakerRule[];
}

export interface MatchResultRecord {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED" | "WALKOVER";
  completedAt?: Date;
}

/**
 * Computes official group or league standings table based on completed match results.
 */
export function computeStandings(
  teams: EngineTeam[],
  matches: MatchResultRecord[],
  config: StandingsConfig = {}
): StandingEntry[] {
  const {
    pointsForWin = 3,
    pointsForDraw = 1,
    pointsForLoss = 0,
    tieBreakers = ["POINTS", "GOAL_DIFFERENCE", "GOALS_FOR", "HEAD_TO_HEAD", "WINS"],
  } = config;

  // Initialize stats for each active team
  const table = new Map<string, StandingEntry>();

  for (const team of teams) {
    if (team.isWithdrawn) continue;
    table.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
      rank: 1,
    });
  }

  // Filter only finished matches (COMPLETED or WALKOVER)
  const completedMatches = matches.filter(
    (m) => (m.status === "COMPLETED" || m.status === "WALKOVER") && m.homeTeamId && m.awayTeamId
  );

  // Process matches
  for (const m of completedMatches) {
    const home = table.get(m.homeTeamId);
    const away = table.get(m.awayTeamId);

    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.points += pointsForWin;
      home.form.push("W");

      away.lost += 1;
      away.points += pointsForLoss;
      away.form.push("L");
    } else if (m.awayScore > m.homeScore) {
      away.won += 1;
      away.points += pointsForWin;
      away.form.push("W");

      home.lost += 1;
      home.points += pointsForLoss;
      home.form.push("L");
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += pointsForDraw;
      away.points += pointsForDraw;
      home.form.push("D");
      away.form.push("D");
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  // Keep only the last 5 results in form
  table.forEach((entry) => {
    entry.form = entry.form.slice(-5);
  });

  const entries = Array.from(table.values());

  // Head-to-Head calculation helper between two tied teams
  function getHeadToHeadPoints(teamAId: string, teamBId: string): number {
    let ptsA = 0;
    for (const m of completedMatches) {
      if (m.homeTeamId === teamAId && m.awayTeamId === teamBId) {
        if (m.homeScore > m.awayScore) ptsA += pointsForWin;
        else if (m.homeScore === m.awayScore) ptsA += pointsForDraw;
      } else if (m.homeTeamId === teamBId && m.awayTeamId === teamAId) {
        if (m.awayScore > m.homeScore) ptsA += pointsForWin;
        else if (m.awayScore === m.homeScore) ptsA += pointsForDraw;
      }
    }
    return ptsA;
  }

  // Sort based on configured tie breakers
  entries.sort((a, b) => {
    for (const rule of tieBreakers) {
      if (rule === "POINTS") {
        if (b.points !== a.points) return b.points - a.points;
      } else if (rule === "GOAL_DIFFERENCE") {
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
      } else if (rule === "GOALS_FOR") {
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      } else if (rule === "HEAD_TO_HEAD") {
        const h2hA = getHeadToHeadPoints(a.teamId, b.teamId);
        const h2hB = getHeadToHeadPoints(b.teamId, a.teamId);
        if (h2hA !== h2hB) return h2hB - h2hA;
      } else if (rule === "WINS") {
        if (b.won !== a.won) return b.won - a.won;
      }
    }

    // Default tie breaker fallback: alphabetically by name
    return a.teamName.localeCompare(b.teamName);
  });

  // Assign ranks
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
