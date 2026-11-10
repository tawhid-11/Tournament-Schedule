import { EngineTeam, EngineMatch, SingleEliminationOptions } from "./types";

/**
 * Calculates standard tournament seeding bracket order for power of 2 size.
 * e.g., for 8 teams: [1, 8, 4, 5, 2, 7, 3, 6]
 */
export function getStandardSeedingOrder(numSlots: number): number[] {
  let order = [1, 2];
  while (order.length < numSlots) {
    const nextOrder: number[] = [];
    const sum = order.length * 2 + 1;
    for (const seed of order) {
      nextOrder.push(seed);
      nextOrder.push(sum - seed);
    }
    order = nextOrder;
  }
  return order;
}

/**
 * Generate Single Elimination bracket matches with support for:
 * - Arbitrary team count (byes for non-powers of 2)
 * - Standard seeded pairings (1 vs 16, 2 vs 15, etc.)
 * - Automatic progression placeholders for subsequent rounds ("Winner of Match X")
 * - Optional 3rd place playoff
 */
export function generateSingleElimination(
  teams: EngineTeam[],
  options: SingleEliminationOptions
): EngineMatch[] {
  const activeTeams = teams.filter((t) => !t.isWithdrawn);
  const n = activeTeams.length;
  if (n < 2) return [];

  const {
    stageId,
    hasThirdPlace = false,
    startRound = 1,
    startMatchNumber = 1,
  } = options;

  // Next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)));
  const totalRounds = Math.log2(bracketSize);

  // Sort teams by seed (or default order)
  const sortedTeams = [...activeTeams].sort((a, b) => {
    const seedA = a.seed ?? 999;
    const seedB = b.seed ?? 999;
    return seedA - seedB;
  });

  // Assign teams into standard bracket slots (1 to bracketSize)
  const seedSlots = getStandardSeedingOrder(bracketSize);
  const slotMap: Array<EngineTeam | null> = new Array(bracketSize).fill(null);

  seedSlots.forEach((slotSeed, slotIndex) => {
    // If we have a team corresponding to this seed
    if (slotSeed <= sortedTeams.length) {
      slotMap[slotIndex] = sortedTeams[slotSeed - 1];
    }
  });

  const matches: EngineMatch[] = [];
  let currentMatchNum = startMatchNumber;

  // Round 1 matches
  const round1Matches: EngineMatch[] = [];
  const numRound1Matches = bracketSize / 2;

  for (let i = 0; i < numRound1Matches; i++) {
    const team1 = slotMap[i * 2];
    const team2 = slotMap[i * 2 + 1];

    const matchId = `se-${stageId}-r${startRound}-m${currentMatchNum}`;

    // Check if one team gets a bye
    const isBye = !team1 || !team2;
    const byeWinner = team1 || team2 || null;

    const match: EngineMatch = {
      id: matchId,
      stageId,
      round: startRound,
      matchday: startRound,
      matchNumber: currentMatchNum++,
      leg: 1,
      homeTeamId: team1?.id || null,
      awayTeamId: team2?.id || null,
      homePlaceholder: team1 ? team1.name : "BYE",
      awayPlaceholder: team2 ? team2.name : "BYE",
      isBye,
      winnerTeamId: isBye && byeWinner ? byeWinner.id : null,
      status: isBye ? "COMPLETED" : "SCHEDULED",
      branch: "WINNERS",
    };

    round1Matches.push(match);
    matches.push(match);
  }

  // Generate subsequent rounds (Quarter-Finals, Semi-Finals, Final)
  let previousRoundMatches = round1Matches;

  for (let r = 2; r <= totalRounds; r++) {
    const roundNumber = startRound + r - 1;
    const currentRoundMatches: EngineMatch[] = [];
    const matchesInRound = previousRoundMatches.length / 2;
    const isFinalRound = r === totalRounds;

    for (let i = 0; i < matchesInRound; i++) {
      const parent1 = previousRoundMatches[i * 2];
      const parent2 = previousRoundMatches[i * 2 + 1];

      const matchId = `se-${stageId}-r${roundNumber}-m${currentMatchNum}`;

      // Resolve teams if parents were byes
      const homeTeamId = parent1.winnerTeamId || null;
      const awayTeamId = parent2.winnerTeamId || null;

      const homePlaceholder = homeTeamId
        ? teams.find((t) => t.id === homeTeamId)?.name || `Winner M${parent1.matchNumber}`
        : `Winner M${parent1.matchNumber}`;

      const awayPlaceholder = awayTeamId
        ? teams.find((t) => t.id === awayTeamId)?.name || `Winner M${parent2.matchNumber}`
        : `Winner M${parent2.matchNumber}`;

      const match: EngineMatch = {
        id: matchId,
        stageId,
        round: roundNumber,
        matchday: roundNumber,
        matchNumber: currentMatchNum++,
        leg: 1,
        homeTeamId,
        awayTeamId,
        homePlaceholder,
        awayPlaceholder,
        homeSourceMatchId: parent1.id,
        awaySourceMatchId: parent2.id,
        homeSourceRule: "WINNER",
        awaySourceRule: "WINNER",
        branch: isFinalRound ? "FINAL" : "WINNERS",
        status: "SCHEDULED",
      };

      currentRoundMatches.push(match);
      matches.push(match);
    }

    // Optional 3rd Place Match in the final round (between Semi-Final losers)
    if (isFinalRound && hasThirdPlace && previousRoundMatches.length === 2) {
      const sf1 = previousRoundMatches[0];
      const sf2 = previousRoundMatches[1];

      const thirdPlaceMatch: EngineMatch = {
        id: `se-${stageId}-r${roundNumber}-3rd-place`,
        stageId,
        round: roundNumber,
        matchday: roundNumber,
        matchNumber: currentMatchNum++,
        leg: 1,
        homeTeamId: null,
        awayTeamId: null,
        homePlaceholder: `Loser M${sf1.matchNumber}`,
        awayPlaceholder: `Loser M${sf2.matchNumber}`,
        homeSourceMatchId: sf1.id,
        awaySourceMatchId: sf2.id,
        homeSourceRule: "LOSER",
        awaySourceRule: "LOSER",
        branch: "THIRD_PLACE",
        status: "SCHEDULED",
      };

      matches.push(thirdPlaceMatch);
    }

    previousRoundMatches = currentRoundMatches;
  }

  return matches;
}
