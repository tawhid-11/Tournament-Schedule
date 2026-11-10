import { EngineTeam, EngineMatch, SwissOptions } from "./types";

export interface SwissTeamStanding {
  teamId: string;
  points: number;
  hasBye: boolean;
}

/**
 * Generate pairings for a Swiss System round.
 * Pairs teams with the same/similar score while avoiding rematches.
 */
export function generateSwissRound(
  teams: EngineTeam[],
  teamScores: Map<string, number>,
  options: SwissOptions
): EngineMatch[] {
  const activeTeams = teams.filter((t) => !t.isWithdrawn);
  if (activeTeams.length < 2) return [];

  const {
    stageId,
    currentRound = 1,
    previousMatches = [],
  } = options;

  // Track already played head-to-heads
  const playedPairs = new Set<string>();
  previousMatches.forEach((m) => {
    playedPairs.add(`${m.homeTeamId}:${m.awayTeamId}`);
    playedPairs.add(`${m.awayTeamId}:${m.homeTeamId}`);
  });

  // Sort teams by points descending, then seed ascending
  const sorted = [...activeTeams].sort((a, b) => {
    const ptsA = teamScores.get(a.id) ?? 0;
    const ptsB = teamScores.get(b.id) ?? 0;
    if (ptsB !== ptsA) return ptsB - ptsA;
    return (a.seed ?? 999) - (b.seed ?? 999);
  });

  const matches: EngineMatch[] = [];
  const paired = new Set<string>();
  let matchNum = (currentRound - 1) * Math.ceil(activeTeams.length / 2) + 1;

  // Handle odd team: lowest ranked team without a previous bye gets a bye
  let byeTeam: EngineTeam | null = null;
  if (sorted.length % 2 !== 0) {
    for (let i = sorted.length - 1; i >= 0; i--) {
      const candidate = sorted[i];
      // Check if candidate already had a bye in previous matches
      const hadBye = previousMatches.some(
        (m) =>
          (m.homeTeamId === candidate.id && !m.awayTeamId) ||
          (m.awayTeamId === candidate.id && !m.homeTeamId)
      );
      if (!hadBye) {
        byeTeam = candidate;
        paired.add(candidate.id);
        break;
      }
    }
    // Fallback if everyone had a bye
    if (!byeTeam) {
      byeTeam = sorted[sorted.length - 1];
      paired.add(byeTeam.id);
    }
  }

  // Pair remaining teams with backtracking/greedy lookahead
  for (let i = 0; i < sorted.length; i++) {
    const team1 = sorted[i];
    if (paired.has(team1.id)) continue;

    let matchedTeam2: EngineTeam | null = null;

    // Look for the next best team that team1 hasn't played yet
    for (let j = i + 1; j < sorted.length; j++) {
      const candidate = sorted[j];
      if (paired.has(candidate.id)) continue;

      const alreadyPlayed = playedPairs.has(`${team1.id}:${candidate.id}`);
      if (!alreadyPlayed) {
        matchedTeam2 = candidate;
        break;
      }
    }

    // If all remaining candidates have already been played (rare in early rounds), pair with first available
    if (!matchedTeam2) {
      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j];
        if (!paired.has(candidate.id)) {
          matchedTeam2 = candidate;
          break;
        }
      }
    }

    if (matchedTeam2) {
      paired.add(team1.id);
      paired.add(matchedTeam2.id);

      matches.push({
        id: `swiss-${stageId}-r${currentRound}-m${matchNum}`,
        stageId,
        round: currentRound,
        matchday: currentRound,
        matchNumber: matchNum++,
        leg: 1,
        homeTeamId: team1.id,
        awayTeamId: matchedTeam2.id,
        homePlaceholder: team1.name,
        awayPlaceholder: matchedTeam2.name,
        status: "SCHEDULED",
      });
    }
  }

  // If there was a bye team, add the bye match record
  if (byeTeam) {
    matches.push({
      id: `swiss-${stageId}-r${currentRound}-bye`,
      stageId,
      round: currentRound,
      matchday: currentRound,
      matchNumber: matchNum++,
      leg: 1,
      homeTeamId: byeTeam.id,
      awayTeamId: null,
      homePlaceholder: byeTeam.name,
      awayPlaceholder: "BYE",
      isBye: true,
      winnerTeamId: byeTeam.id,
      status: "COMPLETED",
    });
  }

  return matches;
}
