import { EngineTeam, EngineMatch, DoubleEliminationOptions } from "./types";
import { getStandardSeedingOrder } from "./single-elimination";

/**
 * Generate a full Double Elimination fixture structure:
 * - Winners Bracket
 * - Losers Bracket (with drops from Winners)
 * - Grand Final
 * - Grand Final Reset (if Losers bracket champion beats Winners champion)
 */
export function generateDoubleElimination(
  teams: EngineTeam[],
  options: DoubleEliminationOptions
): EngineMatch[] {
  const activeTeams = teams.filter((t) => !t.isWithdrawn);
  const n = activeTeams.length;
  if (n < 4) return [];

  const {
    stageId,
    grandFinalReset = true,
    startRound = 1,
    startMatchNumber = 1,
  } = options;

  // Next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)));
  const totalWBrounds = Math.log2(bracketSize);

  const sortedTeams = [...activeTeams].sort(
    (a, b) => (a.seed ?? 999) - (b.seed ?? 999)
  );

  const seedSlots = getStandardSeedingOrder(bracketSize);
  const slotMap: Array<EngineTeam | null> = new Array(bracketSize).fill(null);

  seedSlots.forEach((slotSeed, slotIndex) => {
    if (slotSeed <= sortedTeams.length) {
      slotMap[slotIndex] = sortedTeams[slotSeed - 1];
    }
  });

  const matches: EngineMatch[] = [];
  let currentMatchNum = startMatchNumber;

  // 1. WINNERS BRACKET - ROUND 1
  const wbRoundMatches: EngineMatch[][] = [];
  const wb1: EngineMatch[] = [];
  const numMatchesWB1 = bracketSize / 2;

  for (let i = 0; i < numMatchesWB1; i++) {
    const t1 = slotMap[i * 2];
    const t2 = slotMap[i * 2 + 1];
    const isBye = !t1 || !t2;
    const byeWinner = t1 || t2 || null;

    const m: EngineMatch = {
      id: `de-wb-${stageId}-r1-m${currentMatchNum}`,
      stageId,
      round: startRound,
      matchday: startRound,
      matchNumber: currentMatchNum++,
      leg: 1,
      homeTeamId: t1?.id || null,
      awayTeamId: t2?.id || null,
      homePlaceholder: t1?.name || "BYE",
      awayPlaceholder: t2?.name || "BYE",
      isBye,
      winnerTeamId: isBye && byeWinner ? byeWinner.id : null,
      status: isBye ? "COMPLETED" : "SCHEDULED",
      branch: "WINNERS",
    };
    wb1.push(m);
    matches.push(m);
  }
  wbRoundMatches.push(wb1);

  // Remaining Winners Bracket Rounds
  for (let r = 2; r <= totalWBrounds; r++) {
    const prevMatches = wbRoundMatches[r - 2];
    const currentWBRound: EngineMatch[] = [];
    const count = prevMatches.length / 2;

    for (let i = 0; i < count; i++) {
      const p1 = prevMatches[i * 2];
      const p2 = prevMatches[i * 2 + 1];

      const m: EngineMatch = {
        id: `de-wb-${stageId}-r${r}-m${currentMatchNum}`,
        stageId,
        round: startRound + r - 1,
        matchday: startRound + r - 1,
        matchNumber: currentMatchNum++,
        leg: 1,
        homePlaceholder: `Winner M${p1.matchNumber}`,
        awayPlaceholder: `Winner M${p2.matchNumber}`,
        homeSourceMatchId: p1.id,
        awaySourceMatchId: p2.id,
        homeSourceRule: "WINNER",
        awaySourceRule: "WINNER",
        branch: "WINNERS",
        status: "SCHEDULED",
      };
      currentWBRound.push(m);
      matches.push(m);
    }
    wbRoundMatches.push(currentWBRound);
  }

  // 2. LOSERS BRACKET
  // Total Losers rounds = (totalWBrounds - 1) * 2
  const totalLBRounds = (totalWBrounds - 1) * 2;
  let prevLBMatchList: EngineMatch[] = [];

  for (let lbR = 1; lbR <= totalLBRounds; lbR++) {
    const currentLBMatchList: EngineMatch[] = [];
    const isOddLBRound = lbR % 2 === 1;

    if (lbR === 1) {
      // Round 1 of Losers Bracket: Losers from WB Round 1 play each other
      const wb1Matches = wbRoundMatches[0];
      const numLB1 = wb1Matches.length / 2;

      for (let i = 0; i < numLB1; i++) {
        const p1 = wb1Matches[i * 2];
        const p2 = wb1Matches[i * 2 + 1];

        const m: EngineMatch = {
          id: `de-lb-${stageId}-r${lbR}-m${currentMatchNum}`,
          stageId,
          round: startRound + lbR,
          matchday: startRound + lbR,
          matchNumber: currentMatchNum++,
          leg: 1,
          homePlaceholder: `Loser M${p1.matchNumber}`,
          awayPlaceholder: `Loser M${p2.matchNumber}`,
          homeSourceMatchId: p1.id,
          awaySourceMatchId: p2.id,
          homeSourceRule: "LOSER",
          awaySourceRule: "LOSER",
          branch: "LOSERS",
          status: "SCHEDULED",
        };
        currentLBMatchList.push(m);
        matches.push(m);
      }
    } else if (isOddLBRound) {
      // Odd LB rounds: Winners of previous LB round play each other
      const count = prevLBMatchList.length / 2;
      for (let i = 0; i < count; i++) {
        const p1 = prevLBMatchList[i * 2];
        const p2 = prevLBMatchList[i * 2 + 1];

        const m: EngineMatch = {
          id: `de-lb-${stageId}-r${lbR}-m${currentMatchNum}`,
          stageId,
          round: startRound + lbR,
          matchday: startRound + lbR,
          matchNumber: currentMatchNum++,
          leg: 1,
          homePlaceholder: `Winner M${p1.matchNumber}`,
          awayPlaceholder: `Winner M${p2.matchNumber}`,
          homeSourceMatchId: p1.id,
          awaySourceMatchId: p2.id,
          homeSourceRule: "WINNER",
          awaySourceRule: "WINNER",
          branch: "LOSERS",
          status: "SCHEDULED",
        };
        currentLBMatchList.push(m);
        matches.push(m);
      }
    } else {
      // Even LB rounds: Winners of previous LB round play Losers dropping from WB
      const wbDropRoundIdx = lbR / 2;
      const droppingWBMatches = wbRoundMatches[wbDropRoundIdx] || [];

      for (let i = 0; i < prevLBMatchList.length; i++) {
        const lbParent = prevLBMatchList[i];
        const wbParent = droppingWBMatches[i] || droppingWBMatches[0];

        const m: EngineMatch = {
          id: `de-lb-${stageId}-r${lbR}-m${currentMatchNum}`,
          stageId,
          round: startRound + lbR,
          matchday: startRound + lbR,
          matchNumber: currentMatchNum++,
          leg: 1,
          homePlaceholder: `Winner M${lbParent.matchNumber}`,
          awayPlaceholder: wbParent ? `Loser M${wbParent.matchNumber}` : "TBD",
          homeSourceMatchId: lbParent.id,
          awaySourceMatchId: wbParent?.id || null,
          homeSourceRule: "WINNER",
          awaySourceRule: "LOSER",
          branch: "LOSERS",
          status: "SCHEDULED",
        };
        currentLBMatchList.push(m);
        matches.push(m);
      }
    }

    prevLBMatchList = currentLBMatchList;
  }

  // 3. GRAND FINAL
  // Winner of WB Final vs Winner of LB Final
  const wbFinal = wbRoundMatches[wbRoundMatches.length - 1][0];
  const lbFinal = prevLBMatchList[0];
  const finalRoundNum = startRound + totalLBRounds + 1;

  const grandFinalMatch: EngineMatch = {
    id: `de-gf-${stageId}-m${currentMatchNum}`,
    stageId,
    round: finalRoundNum,
    matchday: finalRoundNum,
    matchNumber: currentMatchNum++,
    leg: 1,
    homePlaceholder: `Winner M${wbFinal.matchNumber} (WB Champ)`,
    awayPlaceholder: `Winner M${lbFinal.matchNumber} (LB Champ)`,
    homeSourceMatchId: wbFinal.id,
    awaySourceMatchId: lbFinal.id,
    homeSourceRule: "WINNER",
    awaySourceRule: "WINNER",
    branch: "FINAL",
    status: "SCHEDULED",
  };
  matches.push(grandFinalMatch);

  // Grand Final Reset Match (if enabled)
  if (grandFinalReset) {
    const gfResetMatch: EngineMatch = {
      id: `de-gf-reset-${stageId}-m${currentMatchNum}`,
      stageId,
      round: finalRoundNum + 1,
      matchday: finalRoundNum + 1,
      matchNumber: currentMatchNum++,
      leg: 2,
      homePlaceholder: `Winner M${grandFinalMatch.matchNumber}`,
      awayPlaceholder: `Loser M${grandFinalMatch.matchNumber}`,
      homeSourceMatchId: grandFinalMatch.id,
      awaySourceMatchId: grandFinalMatch.id,
      homeSourceRule: "WINNER",
      awaySourceRule: "LOSER",
      branch: "FINAL",
      status: "SCHEDULED",
    };
    matches.push(gfResetMatch);
  }

  return matches;
}
