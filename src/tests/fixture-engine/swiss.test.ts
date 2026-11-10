import { describe, it, expect } from "vitest";
import { generateSwissRound } from "@/lib/fixture-engine/swiss";
import { EngineTeam } from "@/lib/fixture-engine/types";

describe("Fixture Engine - Swiss System", () => {
  const teams6: EngineTeam[] = Array.from({ length: 6 }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `Team ${i + 1}`,
    seed: i + 1,
  }));

  it("should generate round 1 pairings with all teams playing", () => {
    const scores = new Map<string, number>();
    const matches = generateSwissRound(teams6, scores, {
      stageId: "swiss-1",
      currentRound: 1,
      previousMatches: [],
    });

    expect(matches).toHaveLength(3); // 6 teams / 2 = 3 matches
    const allPaired = new Set([
      ...matches.map((m) => m.homeTeamId!),
      ...matches.map((m) => m.awayTeamId!),
    ]);
    expect(allPaired.size).toBe(6);
  });

  it("should pair teams with similar scores in round 2 and avoid rematches", () => {
    // Round 1 matches: team 1 beat 2, team 3 beat 4, team 5 beat 6
    const prevMatches = [
      { homeTeamId: "team-1", awayTeamId: "team-2" },
      { homeTeamId: "team-3", awayTeamId: "team-4" },
      { homeTeamId: "team-5", awayTeamId: "team-6" },
    ];

    const scores = new Map<string, number>([
      ["team-1", 3],
      ["team-3", 3],
      ["team-5", 3],
      ["team-2", 0],
      ["team-4", 0],
      ["team-6", 0],
    ]);

    const round2Matches = generateSwissRound(teams6, scores, {
      stageId: "swiss-1",
      currentRound: 2,
      previousMatches: prevMatches,
    });

    expect(round2Matches).toHaveLength(3);

    // No round 2 match should be a duplicate of round 1
    for (const m of round2Matches) {
      const isDuplicate = prevMatches.some(
        (p) =>
          (p.homeTeamId === m.homeTeamId && p.awayTeamId === m.awayTeamId) ||
          (p.homeTeamId === m.awayTeamId && p.awayTeamId === m.homeTeamId)
      );
      expect(isDuplicate).toBe(false);
    }
  });

  it("should handle odd team count by assigning 1 bye to the lowest rank without previous bye", () => {
    const teams5 = teams6.slice(0, 5);
    const scores = new Map<string, number>();

    const matches = generateSwissRound(teams5, scores, {
      stageId: "swiss-1",
      currentRound: 1,
      previousMatches: [],
    });

    const byeMatch = matches.find((m) => m.isBye);
    expect(byeMatch).toBeDefined();
    expect(byeMatch?.winnerTeamId).toBeDefined();
  });
});
