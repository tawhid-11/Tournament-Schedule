import { EngineTeam, EngineMatch, RoundRobinOptions } from "./types";

/**
 * Generate a Round Robin tournament fixture using the standard Circle Method (Berger Tables).
 * - Correctly handles odd number of teams by adding a BYE dummy slot.
 * - Supports 1 leg (single round) or 2 legs (home & away reverse).
 * - Balances home and away fixtures.
 */
export function generateRoundRobin(
  teams: EngineTeam[],
  options: RoundRobinOptions
): EngineMatch[] {
  if (teams.length < 2) {
    return [];
  }

  const {
    stageId,
    groupId = null,
    legs = 1,
    startRound = 1,
    startMatchNumber = 1,
  } = options;

  // Filter out withdrawn teams
  const activeTeams = teams.filter((t) => !t.isWithdrawn);
  if (activeTeams.length < 2) return [];

  // Create a copy of teams list. If odd number, append a dummy BYE team.
  const teamList: Array<EngineTeam | null> = [...activeTeams];
  const isOdd = teamList.length % 2 !== 0;
  if (isOdd) {
    teamList.push(null); // BYE
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const matches: EngineMatch[] = [];
  let currentMatchNumber = startMatchNumber;

  // Circle method: Fix index 0, rotate the rest [1 ... numTeams - 1]
  // Array of indices: [0, 1, 2, ... N-1]
  const indices: number[] = Array.from({ length: numTeams }, (_, i) => i);

  for (let round = 0; round < numRounds; round++) {
    const roundNumber = startRound + round;

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const homeIdx = indices[matchIdx];
      const awayIdx = indices[numTeams - 1 - matchIdx];

      const homeTeam = teamList[homeIdx];
      const awayTeam = teamList[awayIdx];

      // If one of the teams is null (BYE), skip creating an actual match
      if (!homeTeam || !awayTeam) {
        continue;
      }

      // Alternate home/away for the fixed team (index 0) to ensure balance
      let assignedHome = homeTeam;
      let assignedAway = awayTeam;
      if (matchIdx === 0 && round % 2 === 1) {
        assignedHome = awayTeam;
        assignedAway = homeTeam;
      }

      matches.push({
        id: `rr-${stageId}-${groupId || "main"}-r${roundNumber}-m${currentMatchNumber}`,
        stageId,
        groupId,
        round: roundNumber,
        matchday: roundNumber,
        matchNumber: currentMatchNumber++,
        leg: 1,
        homeTeamId: assignedHome.id,
        awayTeamId: assignedAway.id,
        homePlaceholder: assignedHome.name,
        awayPlaceholder: assignedAway.name,
        status: "SCHEDULED",
      });
    }

    // Rotate indices: keep index 0 fixed, rotate the rest right
    const fixed = indices[0];
    const rest = indices.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    indices.splice(0, indices.length, fixed, ...rest);
  }

  // If 2 legs (Home & Away return leg)
  if (legs === 2) {
    const leg1Matches = [...matches];
    for (let round = 0; round < numRounds; round++) {
      const leg2RoundNumber = startRound + numRounds + round;
      const leg1RoundMatches = leg1Matches.filter(
        (m) => m.round === startRound + round
      );

      for (const leg1Match of leg1RoundMatches) {
        matches.push({
          id: `rr-${stageId}-${groupId || "main"}-r${leg2RoundNumber}-m${currentMatchNumber}`,
          stageId,
          groupId,
          round: leg2RoundNumber,
          matchday: leg2RoundNumber,
          matchNumber: currentMatchNumber++,
          leg: 2,
          homeTeamId: leg1Match.awayTeamId,
          awayTeamId: leg1Match.homeTeamId,
          homePlaceholder: leg1Match.awayPlaceholder,
          awayPlaceholder: leg1Match.homePlaceholder,
          status: "SCHEDULED",
        });
      }
    }
  }

  return matches;
}
