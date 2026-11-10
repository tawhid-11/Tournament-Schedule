import { describe, it, expect } from "vitest";
import {
  generateSingleElimination,
  getStandardSeedingOrder,
} from "@/lib/fixture-engine/single-elimination";
import { EngineTeam } from "@/lib/fixture-engine/types";

describe("Fixture Engine - Single Elimination", () => {
  it("should generate correct seeding sequence for 8 slots", () => {
    const seeds = getStandardSeedingOrder(8);
    // Standard 8 bracket pairs: (1,8), (4,5), (2,7), (3,6)
    expect(seeds).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it("should generate 7 matches for an 8-team single elimination tournament", () => {
    const teams8: EngineTeam[] = Array.from({ length: 8 }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      seed: i + 1,
    }));

    const matches = generateSingleElimination(teams8, {
      stageId: "stage-knockout",
      hasThirdPlace: false,
    });

    // 4 QF + 2 SF + 1 Final = 7 matches
    expect(matches).toHaveLength(7);

    // Verify Round 1 matchups are seeded: 1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6
    const r1 = matches.filter((m) => m.round === 1);
    expect(r1).toHaveLength(4);
    expect(r1[0].homeTeamId).toBe("team-1");
    expect(r1[0].awayTeamId).toBe("team-8");

    expect(r1[1].homeTeamId).toBe("team-4");
    expect(r1[1].awayTeamId).toBe("team-5");

    expect(r1[2].homeTeamId).toBe("team-2");
    expect(r1[2].awayTeamId).toBe("team-7");

    expect(r1[3].homeTeamId).toBe("team-3");
    expect(r1[3].awayTeamId).toBe("team-6");
  });

  it("should handle non-power-of-2 team counts (e.g. 5 teams) using byes", () => {
    const teams5: EngineTeam[] = Array.from({ length: 5 }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      seed: i + 1,
    }));

    const matches = generateSingleElimination(teams5, {
      stageId: "stage-knockout",
      hasThirdPlace: false,
    });

    // Bracket size is 8. Round 1 has 4 matches, where seeds 1, 2, 3 receive byes
    const r1 = matches.filter((m) => m.round === 1);
    expect(r1).toHaveLength(4);

    const byeMatches = r1.filter((m) => m.isBye);
    expect(byeMatches.length).toBe(3); // 8 - 5 = 3 byes

    // Byes should automatically advance the seeded team
    const topSeedMatch = r1.find((m) => m.homeTeamId === "team-1");
    expect(topSeedMatch?.isBye).toBe(true);
    expect(topSeedMatch?.winnerTeamId).toBe("team-1");
  });

  it("should include a 3rd-place playoff match when enabled", () => {
    const teams4: EngineTeam[] = Array.from({ length: 4 }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      seed: i + 1,
    }));

    const matches = generateSingleElimination(teams4, {
      stageId: "stage-knockout",
      hasThirdPlace: true,
    });

    // 2 Semis + 1 Final + 1 Third Place = 4 matches
    expect(matches).toHaveLength(4);

    const thirdPlaceMatch = matches.find((m) => m.branch === "THIRD_PLACE");
    expect(thirdPlaceMatch).toBeDefined();
    expect(thirdPlaceMatch?.homeSourceRule).toBe("LOSER");
    expect(thirdPlaceMatch?.awaySourceRule).toBe("LOSER");
  });
});
