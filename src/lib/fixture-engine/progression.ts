import { EngineMatch, EngineTeam, MatchScoreInput } from "./types";
import { StandingEntry } from "./types";

export interface MatchResolutionResult {
  completedMatch: EngineMatch;
  updatedSubsequentMatches: EngineMatch[];
}

/**
 * Determine winner and loser based on score input and sport rules.
 */
export function determineMatchWinner(
  match: EngineMatch,
  score: MatchScoreInput
): { winnerId: string | null; loserId: string | null } {
  if (score.isWalkover && score.walkoverWinnerId) {
    const winnerId = score.walkoverWinnerId;
    const loserId =
      (winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId) ??
      null;
    return { winnerId, loserId };
  }

  // Penalty shootout tie-breaker
  if (score.isPenalties && score.homePenaltyScore !== undefined && score.awayPenaltyScore !== undefined) {
    if (score.homePenaltyScore > score.awayPenaltyScore) {
      return { winnerId: match.homeTeamId || null, loserId: match.awayTeamId || null };
    } else if (score.awayPenaltyScore > score.homePenaltyScore) {
      return { winnerId: match.awayTeamId || null, loserId: match.homeTeamId || null };
    }
  }

  // Regular/Extra time score
  if (score.homeScore > score.awayScore) {
    return { winnerId: match.homeTeamId || null, loserId: match.awayTeamId || null };
  } else if (score.awayScore > score.homeScore) {
    return { winnerId: match.awayTeamId || null, loserId: match.homeTeamId || null };
  }

  // Draw
  return { winnerId: null, loserId: null };
}

/**
 * Propagate a completed match's winner or loser to downstream dependent bracket matches.
 */
export function resolveBracketProgression(
  completedMatch: EngineMatch,
  score: MatchScoreInput,
  allMatches: EngineMatch[],
  teams: EngineTeam[]
): MatchResolutionResult {
  const { winnerId, loserId } = determineMatchWinner(completedMatch, score);

  const updatedCompletedMatch: EngineMatch = {
    ...completedMatch,
    winnerTeamId: winnerId,
    status: score.isWalkover ? "WALKOVER" : "COMPLETED",
  };

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const updatedSubsequentMatches: EngineMatch[] = [];

  for (const match of allMatches) {
    let matchChanged = false;
    let newHomeTeamId = match.homeTeamId;
    let newHomePlaceholder = match.homePlaceholder;
    let newAwayTeamId = match.awayTeamId;
    let newAwayPlaceholder = match.awayPlaceholder;

    // Check Home Slot dependency
    if (match.homeSourceMatchId === completedMatch.id) {
      const advancingTeamId =
        match.homeSourceRule === "LOSER" ? loserId : winnerId;
      if (advancingTeamId) {
        newHomeTeamId = advancingTeamId;
        newHomePlaceholder = teamMap.get(advancingTeamId)?.name || newHomePlaceholder;
        matchChanged = true;
      }
    }

    // Check Away Slot dependency
    if (match.awaySourceMatchId === completedMatch.id) {
      const advancingTeamId =
        match.awaySourceRule === "LOSER" ? loserId : winnerId;
      if (advancingTeamId) {
        newAwayTeamId = advancingTeamId;
        newAwayPlaceholder = teamMap.get(advancingTeamId)?.name || newAwayPlaceholder;
        matchChanged = true;
      }
    }

    if (matchChanged) {
      updatedSubsequentMatches.push({
        ...match,
        homeTeamId: newHomeTeamId,
        homePlaceholder: newHomePlaceholder,
        awayTeamId: newAwayTeamId,
        awayPlaceholder: newAwayPlaceholder,
      });
    }
  }

  return {
    completedMatch: updatedCompletedMatch,
    updatedSubsequentMatches,
  };
}

/**
 * Connects group stage standings to knockout bracket matches.
 * e.g., "1st Group A" vs "2nd Group B"
 */
export function linkGroupStageToKnockout(
  groupStandings: Map<string, StandingEntry[]>, // key: groupName or groupId
  knockoutMatches: EngineMatch[],
  teams: EngineTeam[]
): EngineMatch[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return knockoutMatches.map((match) => {
    let updated = { ...match };

    // Resolve Home Placeholder like "1st Group A" or "Winner Group A"
    if (!updated.homeTeamId && updated.homePlaceholder) {
      const resolved = resolveGroupPlaceholder(
        updated.homePlaceholder,
        groupStandings,
        teamMap
      );
      if (resolved) {
        updated.homeTeamId = resolved.id;
        updated.homePlaceholder = resolved.name;
      }
    }

    // Resolve Away Placeholder like "2nd Group B" or "Runner-up Group B"
    if (!updated.awayTeamId && updated.awayPlaceholder) {
      const resolved = resolveGroupPlaceholder(
        updated.awayPlaceholder,
        groupStandings,
        teamMap
      );
      if (resolved) {
        updated.awayTeamId = resolved.id;
        updated.awayPlaceholder = resolved.name;
      }
    }

    return updated;
  });
}

function resolveGroupPlaceholder(
  placeholder: string,
  groupStandings: Map<string, StandingEntry[]>,
  teamMap: Map<string, EngineTeam>
): EngineTeam | null {
  // Regex pattern for "1st Group A", "Winner Group A", "2nd Group B", "Runner-up Group B"
  const regex = /(1st|Winner|2nd|Runner-up|3rd)\s+Group\s+([A-Z0-9]+)/i;
  const match = placeholder.match(regex);
  if (!match) return null;

  const positionStr = match[1].toLowerCase();
  const groupKey = `Group ${match[2].toUpperCase()}`;

  const standings = groupStandings.get(groupKey);
  if (!standings || standings.length === 0) return null;

  let targetRank = 1;
  if (positionStr === "2nd" || positionStr === "runner-up") {
    targetRank = 2;
  } else if (positionStr === "3rd") {
    targetRank = 3;
  }

  const standingRow = standings.find((s) => s.rank === targetRank);
  if (!standingRow) return null;

  return teamMap.get(standingRow.teamId) || null;
}
